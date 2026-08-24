import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@multiversetracker.com';

export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
}
