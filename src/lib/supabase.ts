import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a mock client for build time when env vars are not set
const createSupabaseClient = () => {
  if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || !supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
    // Return a mock client for build time
    return {
      storage: {
        from: () => ({
          upload: async () => ({ data: { path: '' }, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: () => ({
              eq: () => ({
                is: () => ({
                  single: async () => ({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    } as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();