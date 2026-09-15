// Cloudflare Pages Function — étape 2 du flux OAuth GitHub pour Decap CMS.
// Échange le code contre un token (côté serveur, le secret ne quitte jamais Cloudflare)
// puis le renvoie à la fenêtre d'admin via postMessage, selon le protocole attendu par Decap CMS.

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

export async function onRequestGet(context) {
  const { request, env } = context;
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
