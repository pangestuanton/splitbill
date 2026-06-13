import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder credentials during build time to prevent static generation crashes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-for-compilation';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

