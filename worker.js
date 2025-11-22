export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cookie 認証チェック
    const cookie = request.headers.get("Cookie") || "";
    const loggedIn = cookie.includes("auth=");

    // ログインしていない & /login 以外 → 強制リダイレクト
    if (!loggedIn && !url.pathname.startsWith("/login")) {
      return Response.redirect("/login", 302);
    }

    // HTML 以外（画像、CSS、JS など）はそのまま返す
    const res = await fetch(request);
    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      return res;
    }

    // HTML ページは head に自動で script を追加
    return new HTMLRewriter()
      .on("head", {
        element(el) {
          el.append(`
            <script>
              // 追加される共通スクリプト（ページ側を編集しなくてOK）
              console.log("auth-check script injected");

              // クライアントサイドでも fallback チェック可能
              const hasAuth = document.cookie.includes("auth=");
              if (!hasAuth && !location.pathname.startsWith("/login")) {
                location.href = "/login";
              }
            </script>
          `, { html: true });
        }
      })
      .transform(res);
  }
};
