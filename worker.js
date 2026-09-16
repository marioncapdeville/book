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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/auth") return handleAuth(request, env);
    if (url.pathname === "/api/callback") return handleCallback(request, env);

    const response = await env.ASSETS.fetch(request);

    // L'admin ne doit jamais être mis en cache (par Cloudflare, le navigateur,
    // ou un proxy intermédiaire) : sinon Decap CMS peut charger une config ou
    // un widget périmés après chaque mise à jour du site.
    if (url.pathname.startsWith("/admin")) {
      const fresh = new Response(response.body, response);
      fresh.headers.set("Cache-Control", "no-store, must-revalidate");
      return fresh;
    }

    return response;
  },
};
