// Cloudflare Pages Function: POST /api/chat
// APIキーは環境変数(Secret) ANTHROPIC_API_KEY に保存され、ブラウザには一切出ません。
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    // 受け取るのは model / max_tokens / system / messages のみ。安全のため上限を固定。
    const payload = {
      model: "claude-haiku-4-5",
      max_tokens: Math.min(body.max_tokens || 1024, 1500),
      system: typeof body.system === "string" ? body.system : "",
      messages: Array.isArray(body.messages) ? body.messages.slice(-8) : []
    };
    if (!payload.messages.length) {
      return json({ error: "messages required" }, 400);
    }
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "content-type": "application/json; charset=utf-8" }
  });
}
// GET等は拒否
export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  return onRequestPost(context);
}
