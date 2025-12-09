// Supabase Edge Function: hyper-endpoint
// Simple echo handler with CORS support
// POST JSON: { name?: string }

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const name = typeof payload?.name === "string" && payload.name.trim() ? payload.name.trim() : "World";
    return json({ message: `Hello, ${name}!` });
  } catch (e) {
    const msg = e && typeof e === "object" && "message" in e ? (e as any).message : "Unexpected error";
    return json({ error: msg }, 500);
  }
});
