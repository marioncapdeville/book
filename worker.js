// Cloudflare Worker — sert le site statique (via l'assets binding) et implémente
// le flux OAuth GitHub attendu par Decap CMS pour l'admin (/admin).
//
// - GET /api/auth      : redirige vers GitHub, pose un cookie d'état anti-CSRF
// - GET /api/callback  : échange le code contre un token (côté serveur, le secret
//                        ne quitte jamais Cloudflare) puis le renvoie à la fenêtre
//                        d'admin via postMessage, selon le protocole Decap CMS.
// - tout le reste      : servi tel quel depuis les fichiers statiques (_site)

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function renderResult(status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      ${JSON.stringify(message)},
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body>
</html>`;
}

async function handleAuth(request, env) {
  const url = new URL(request.url);

  if (!env.GITHUB_CLIENT_ID) {
    return new Response("GITHUB_CLIENT_ID manquant dans les variables d'environnement.", { status: 500 });
  }

  const redirectUri = `${url.origin}/api/callback`;
  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo,user");
  authorizeUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      "Set-Cookie": `oauth_state=${state}; HttpOnly; Secure; Path=/; Max-Age=600; SameSite=Lax`,
    },
  });
}

async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = getCookie(request, "oauth_state");
  const clearCookie = "oauth_state=; HttpOnly; Secure; Path=/; Max-Age=0";

  if (!code || !state || state !== cookieState) {
    return new Response(renderResult("error", { message: "État invalide ou code manquant. Réessaie la connexion." }), {
      status: 400,
      headers: { "Content-Type": "text/html", "Set-Cookie": clearCookie },
    });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/api/callback`,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return new Response(renderResult("error", { message: tokenData.error_description || "Échec de l'authentification GitHub." }), {
      status: 400,
      headers: { "Content-Type": "text/html", "Set-Cookie": clearCookie },
    });
  }

  return new Response(renderResult("success", { token: tokenData.access_token, provider: "github" }), {
    status: 200,
    headers: { "Content-Type": "text/html", "Set-Cookie": clearCookie },
  });
}

const REPO = "marioncapdeville/book";
const BRANCH = "main";
const ORDER_PATH = "src/_data/projectOrder.json";

function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function b64decode(str) {
  return decodeURIComponent(escape(atob(str)));
}

async function handleSaveOrder(request) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return new Response(JSON.stringify({ error: "Non connectée à GitHub." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Corps de requête invalide." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const order = body && body.order;
  if (!Array.isArray(order) || order.length === 0 || !order.every((s) => typeof s === "string" && s.length > 0)) {
    return new Response(JSON.stringify({ error: "Liste d'ordre invalide." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ghHeaders = {
    Authorization: `token ${token}`,
    "User-Agent": "marion-book-reorder-tool",
    Accept: "application/vnd.github+json",
  };

  const getRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${ORDER_PATH}?ref=${BRANCH}`,
    { headers: ghHeaders }
  );
  if (!getRes.ok) {
    const errText = await getRes.text();
    return new Response(JSON.stringify({ error: "Impossible de lire le fichier d'ordre actuel.", detail: errText }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
  const getData = await getRes.json();
  const sha = getData.sha;

  const newContent = JSON.stringify(order, null, 2) + "\n";

  const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${ORDER_PATH}`, {
    method: "PUT",
    headers: { ...ghHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Réorganise les projets (outil glisser-déposer)",
      content: b64encode(newContent),
      sha,
      branch: BRANCH,
    }),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    return new Response(JSON.stringify({ error: "Échec de l'enregistrement sur GitHub.", detail: errText }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------- Réorganisation des images d'une galerie (/reorder-galerie/) ----------
// Réécrit uniquement l'ordre des éléments du bloc « gallery: » d'une fiche projet,
// sans toucher au reste du fichier (textes, réglages, version anglaise…).
function reorderGalleryBlock(fileText, order) {
  const fmEnd = fileText.indexOf("\n---", 4);
  if (!fileText.startsWith("---") || fmEnd === -1) throw new Error("Fiche projet illisible.");
  const lines = fileText.slice(0, fmEnd).split("\n");
  const start = lines.findIndex((l) => /^gallery:\s*$/.test(l));
  if (start === -1) throw new Error("Ce projet n'a pas de galerie.");
  let end = start + 1;
  while (end < lines.length && (lines[end] === "" || /^\s/.test(lines[end]))) end++;
  const block = lines.slice(start + 1, end);
  const first = block.find((l) => /^\s*- /.test(l));
  if (!first) throw new Error("Galerie vide.");
  const indent = first.match(/^(\s*)- /)[1];
  const items = [];
  for (const l of block) {
    if (l.startsWith(indent + "- ")) items.push([l]);
    else if (items.length) items[items.length - 1].push(l);
  }
  const imageOf = (item) => {
    const m = item.join("\n").match(/image:\s*(?:[>|][-+]?\s*\n\s*)?['"]?([^\s'"]+)/);
    return m ? m[1] : null;
  };
  const byImage = new Map();
  for (const it of items) {
    const img = imageOf(it);
    if (!img) throw new Error("Un visuel de la galerie est illisible.");
    if (!byImage.has(img)) byImage.set(img, []);
    byImage.get(img).push(it);
  }
  const current = items.map(imageOf).slice().sort().join("|");
  if (order.slice().sort().join("|") !== current) {
    throw new Error("La galerie a été modifiée entre-temps (dans l'admin ?). Recharge la page et recommence.");
  }
  const sorted = order.map((img) => byImage.get(img).shift());
  const out = [...lines.slice(0, start + 1), ...sorted.flat(), ...lines.slice(end)];
  return out.join("\n") + fileText.slice(fmEnd);
}

async function handleSaveGallery(request) {
  const json = (obj, status) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return json({ error: "Non connectée à GitHub." }, 401);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "Requête invalide." }, 400); }
  const file = body && body.file;
  const order = body && body.order;
  if (typeof file !== "string" || !/^src\/projects\/[^/]+\.md$/.test(file)) return json({ error: "Projet invalide." }, 400);
  if (!Array.isArray(order) || !order.length || !order.every((s) => typeof s === "string" && s)) return json({ error: "Ordre invalide." }, 400);

  const ghHeaders = { Authorization: `token ${token}`, "User-Agent": "marion-book-reorder-tool", Accept: "application/vnd.github+json" };
  const apiPath = `https://api.github.com/repos/${REPO}/contents/${file.split("/").map(encodeURIComponent).join("/")}`;
  const getRes = await fetch(`${apiPath}?ref=${BRANCH}`, { headers: ghHeaders });
  if (!getRes.ok) return json({ error: "Impossible de lire la fiche du projet.", detail: await getRes.text() }, 502);
  const getData = await getRes.json();

  let newText;
  try { newText = reorderGalleryBlock(b64decode(getData.content.replace(/\n/g, "")), order); }
  catch (e) { return json({ error: e.message }, 409); }

  const putRes = await fetch(apiPath, {
    method: "PUT",
    headers: { ...ghHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Réorganise la galerie de ${file.replace(/^src\/projects\//, "").replace(/\.md$/, "")} (outil glisser-déposer)`,
      content: b64encode(newText),
      sha: getData.sha,
      branch: BRANCH,
    }),
  });
  if (!putRes.ok) return json({ error: "Échec de l'enregistrement sur GitHub.", detail: await putRes.text() }, 502);
  return json({ ok: true }, 200);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/auth") return handleAuth(request, env);
    if (url.pathname === "/api/callback") return handleCallback(request, env);
    if (url.pathname === "/api/save-order" && request.method === "POST") return handleSaveOrder(request);
    if (url.pathname === "/api/save-gallery" && request.method === "POST") return handleSaveGallery(request);

    const response = await env.ASSETS.fetch(request);

    // L'admin ne doit jamais être mis en cache (par Cloudflare, le navigateur,
    // ou un proxy intermédiaire) : sinon Decap CMS peut charger une config ou
    // un widget périmés après chaque mise à jour du site.
    if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/reorder")) {
      const fresh = new Response(response.body, response);
      fresh.headers.set("Cache-Control", "no-store, must-revalidate");
      return fresh;
    }

    return response;
  },
};
