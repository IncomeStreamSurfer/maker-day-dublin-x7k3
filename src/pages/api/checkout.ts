import type { APIRoute } from 'astro';
import { stripe } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  const form = await request.formData();
  const productId = form.get('product_id')?.toString();

  if (!productId) {
    return new Response('Missing product_id', { status: 400 });
  }

  const { data: product, error } = await supabase
    .from('mdd_products')
    .select('*')
    .eq('id', productId)
    .eq('active', true)
    .maybeSingle();

  if (error || !product) {
    return new Response('Product not found', { status: 404 });
  }

  const origin =
    import.meta.env.PUBLIC_SITE_URL ||
    `${url.protocol}//${url.host}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: product.currency,
          unit_amount: product.price_pence,
          product_data: {
            name: `Maker Day Dublin — ${product.name}`,
            description: product.description || undefined,
          },
        },
      },
    ],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
    metadata: { product_id: product.id },
    // Collect name + email so we can email the ticket
    customer_creation: 'always',
    phone_number_collection: { enabled: false },
  });

  return Response.redirect(session.url!, 303);
};
