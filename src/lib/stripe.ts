import Stripe from 'stripe';

const key = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!key) throw new Error('Missing STRIPE_SECRET_KEY');

export const stripe = new Stripe(key, {
  // Pin to a current API version; Stripe's types accept any date string.
  apiVersion: '2024-12-18.acacia' as any,
});
