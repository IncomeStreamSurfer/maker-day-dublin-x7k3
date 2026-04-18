import type { APIRoute } from 'astro';
import { stripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabase';
import { sendEmail, ticketEmailHtml } from '../../../lib/email';
import { generateTicketCode } from '../../../lib/ticket';

export const prerender = false;

const WEBHOOK_SECRET =
  import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret missing', { status: 500 });
  }
  if (!sig) {
    return new Response('Missing signature', { status: 400 });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const productId = session.metadata?.product_id as string | undefined;
    const email = session.customer_details?.email || session.customer_email || null;
    const name = session.customer_details?.name || null;

    const ticketCode = generateTicketCode();

    // Resolve product name for email
    let productName = 'Ticket';
    if (productId) {
      const { data: product } = await supabase
        .from('mdd_products')
        .select('name')
        .eq('id', productId)
        .maybeSingle();
      if (product?.name) productName = product.name;
    }

    // Write order (idempotent on stripe_session_id)
    const { error: insertErr } = await supabase.from('mdd_orders').insert({
      stripe_session_id: session.id,
      product_id: productId || null,
      email,
      name,
      amount_pence: session.amount_total ?? 0,
      currency: (session.currency || 'gbp').toLowerCase(),
      ticket_code: ticketCode,
      status: 'paid',
    });

    if (insertErr && !insertErr.message.includes('duplicate')) {
      console.error('Failed to insert order:', insertErr);
    }

    // Send confirmation email
    if (email) {
      await sendEmail({
        to: email,
        subject: `Your Maker Day Dublin ticket (${ticketCode})`,
        html: ticketEmailHtml({
          name: name || undefined,
          ticketCode,
          productName,
          amountPence: session.amount_total ?? 0,
          currency: session.currency || 'gbp',
        }),
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
