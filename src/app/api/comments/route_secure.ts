import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth';
import { commentSchema, validateInput, sanitizeHtml } from '@/lib/validation';

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);

    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const designId = searchParams.get('designId');

    if (!designId) {
      return NextResponse.json({ error: 'Design ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: design, error: designError } = await supabase
      .from('designs')
      .select('id, user_id, tenant_id, is_public')
      .eq('unique_id', designId)
      .single();

    if (designError || !design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const user = await (await import('@/lib/auth')).getCurrentUser();

    if (!design.is_public) {
      if (!user || user.id !== design.user_id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        design_id,
        author_name,
        author_email,
        x_percent,
        y_percent,
        content,
        is_resolved,
        created_at,
        updated_at
      `)
      .eq('design_id', design.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (commentsError) {
      throw new Error(`Failed to fetch comments: ${commentsError.message}`);
    }

    return NextResponse.json({ 
      comments: comments || [],
      design: {
        id: design.id,
        isPublic: design.is_public,
      },
    });
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
