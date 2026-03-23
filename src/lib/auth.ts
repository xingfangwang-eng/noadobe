import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function getUserTenant(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('tenant_id, subscription_tier, subscription_status, subscription_expires_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('Failed to fetch user tenant');
  }

  return data;
}

export async function checkSubscription(tenantId: string, requiredTier: string = 'free') {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();

  if (error || !data) {
    throw new Error('Failed to fetch tenant');
  }

  if (!data.is_active) {
    throw new Error('Tenant is not active');
  }

  const tiers = ['free', 'pro', 'enterprise'];
  const currentTierIndex = tiers.indexOf(data.plan);
  const requiredTierIndex = tiers.indexOf(requiredTier);

  if (currentTierIndex < requiredTierIndex) {
    throw new Error(`Subscription tier ${requiredTier} required`);
  }

  return data;
}

export async function checkUsageLimit(userId: string, tenantId: string, action: string) {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { count, error } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .eq('action', action)
    .gte('created_at', startOfMonth.toISOString());

  if (error) {
    throw new Error('Failed to check usage');
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('max_designs, max_comments_per_design, max_file_size_mb')
    .eq('id', tenantId)
    .single();

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const limits: Record<string, number> = {
    'upload_design': tenant.max_designs,
    'create_comment': tenant.max_comments_per_design,
  };

  const limit = limits[action];
  if (limit && count && count >= limit) {
    throw new Error(`Usage limit exceeded for ${action}`);
  }

  return true;
}

export async function logUsage(userId: string, tenantId: string, action: string, metadata?: Record<string, any>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      tenant_id: tenantId,
      action,
      metadata: metadata || {},
    });

  if (error) {
    console.error('Failed to log usage:', error);
  }
}
