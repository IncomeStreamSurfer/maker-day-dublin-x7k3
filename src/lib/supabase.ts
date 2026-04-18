import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

export type Talk = {
  id: number;
  start_time: string;
  end_time: string;
  title: string;
  description: string | null;
  speaker_slug: string | null;
  room: string | null;
  sort_order: number;
};

export type Speaker = {
  id: number;
  slug: string;
  name: string;
  role: string | null;
  company: string | null;
  bio: string | null;
  photo_url: string | null;
  twitter: string | null;
  website: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  price_pence: number;
  currency: string;
  image_url: string | null;
  description: string | null;
  active: boolean;
  sort_order: number;
};
