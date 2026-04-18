const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY missing; skipping email send.');
    return { ok: false, skipped: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: opts.from || 'Maker Day Dublin <onboarding@resend.dev>',
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('Resend error', res.status, body);
    return { ok: false, error: body };
  }
  return { ok: true, data: await res.json() };
}

export function ticketEmailHtml(opts: {
  name?: string;
  ticketCode: string;
  productName: string;
  amountPence: number;
  currency: string;
}) {
  const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: opts.currency.toUpperCase() }).format(opts.amountPence / 100);
  const hello = opts.name ? `Hi ${opts.name},` : 'Hi there,';
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width:560px; margin:0 auto; padding:32px 24px; color:#0e1116;">
    <div style="background:#0e1116; color:#f7f3ec; padding:28px 24px; border-radius:16px 16px 0 0;">
      <div style="font-size:13px; letter-spacing:0.2em; text-transform:uppercase; opacity:0.7;">Maker Day Dublin</div>
      <div style="font-size:28px; font-weight:700; margin-top:8px;">You're in. See you on 14 June.</div>
    </div>
    <div style="background:#fff; padding:28px 24px; border:1px solid #e8e3d8; border-top:0; border-radius:0 0 16px 16px;">
      <p style="margin:0 0 12px 0; font-size:15px;">${hello}</p>
      <p style="margin:0 0 20px 0; font-size:15px; line-height:1.6;">
        Your <strong>${opts.productName}</strong> is confirmed — thank you for supporting the Irish maker community.
        Show this email (or just the code) at the door.
      </p>
      <div style="background:#f7f3ec; border:1px dashed #0e1116; border-radius:12px; padding:20px; text-align:center; margin:20px 0;">
        <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; opacity:0.7;">Your ticket code</div>
        <div style="font-family: 'SF Mono', Menlo, monospace; font-size:28px; font-weight:700; margin-top:6px; letter-spacing:0.08em;">${opts.ticketCode}</div>
        <div style="font-size:12px; margin-top:10px; opacity:0.7;">Amount paid: ${money}</div>
      </div>
      <p style="margin:20px 0 8px 0; font-size:14px; line-height:1.6;"><strong>When:</strong> Saturday 14 June — doors 09:00, first talk 09:30</p>
      <p style="margin:0 0 8px 0; font-size:14px; line-height:1.6;"><strong>Where:</strong> Maker Hall, Dublin 2</p>
      <p style="margin:0 0 20px 0; font-size:14px; line-height:1.6;"><strong>What to bring:</strong> just yourself. Laptop optional. We'll have coffee, lunch, and the full schedule printed.</p>
      <p style="margin:0; font-size:14px; line-height:1.6; color:#555;">Reply to this email if anything comes up.<br/>— The Maker Day Dublin team</p>
    </div>
  </div>`;
}
