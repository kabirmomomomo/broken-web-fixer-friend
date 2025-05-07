
import { createClient } from '@supabase/supabase-js';
import { supabase as hardcodedClient } from '@/integrations/supabase/client';

// Check if Supabase is available by checking if URL and key are defined
export const isDatabaseAvailable = !!import.meta.env.VITE_SUPABASE_URL && 
                                  !!import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the supabase client - use the hardcoded client as fallback
export const supabase = isDatabaseAvailable
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
  : hardcodedClient;

// Log which client is being used
if (!isDatabaseAvailable) {
  console.log('Using hardcoded Supabase client from integrations folder as fallback');
}
