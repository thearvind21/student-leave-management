// Supabase Edge Function: send-email
// Deno runtime
// Expects secrets: RESEND_API_KEY, FROM_EMAIL
// Request body: { to: string, subject: string, text?: string, html?: string }

import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
  try {
    // Support two payload shapes:
    // 1) Direct: { to, subject, text?, html? }
    // 2) Templated: { to, name?, decision?: 'accepted'|'rejected', note? }
    const body = await req.json() as any;
    const to: string | undefined = body?.to;
    let subject: string | undefined = body?.subject;
    let text: string | undefined = body?.text;
    let html: string | undefined = body?.html;
    const name: string | undefined = body?.name;
    const decision: 'accepted' | 'rejected' | undefined = body?.decision;
    const note: string | undefined = body?.note;

    // If subject/text/html not provided, build from decision template
    if (!subject) {
      if (decision === 'accepted') subject = 'Your demo request has been accepted';
      else if (decision === 'rejected') subject = 'Regarding your demo request';
      else subject = 'Regarding your request';
    }

    if (!text || !html) {
      const greeting = `Hi ${name || 'there'},`;
      const acceptedBody = `Thanks for your interest in Student Leave Central. We'd love to give you a quick walkthrough. Let us know a suitable time.\n\n${note ? 'Note: ' + note + '\n\n' : ''}Regards,\nAdmin Team`;
      const rejectedBody = `Thanks for your interest in Student Leave Central. At the moment, we won't be proceeding with a demo.\n\n${note ? 'Note: ' + note + '\n\n' : ''}Regards,\nAdmin Team`;
      const genericBody = `Thanks for reaching out.\n\n${note ? 'Note: ' + note + '\n\n' : ''}Regards,\nAdmin Team`;

      const chosen = decision === 'accepted' ? acceptedBody : decision === 'rejected' ? rejectedBody : genericBody;
      if (!text) text = `${greeting}\n\n${chosen}`;
      if (!html) html = `<p>${greeting}</p><p>${chosen.replace(/\n/g, '<br/>')}</p>`;
    }

    if (!to || !subject) {
      return new Response(JSON.stringify({ error: 'Missing to/subject' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    const API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM = Deno.env.get('FROM_EMAIL');
    if (!API_KEY || !FROM) {
      console.error('send-email: provider not configured');
      return new Response(JSON.stringify({ error: 'Email provider not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const payload: Record<string, unknown> = { from: FROM, to, subject };
    if (text) payload.text = text;
    if (html) payload.html = html;

    console.log('send-email: start', { to, subject, hasText: Boolean(text), hasHtml: Boolean(html) });

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    console.log('send-email: provider response', { status: resp.status, ok: resp.ok, id: (data && (data.id || data.data?.id)) || null });
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data?.message || 'Failed to send email', details: data }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    const msg = e && typeof e === 'object' && 'message' in e ? (e as any).message : 'Unexpected error';
    console.error('send-email: exception', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
