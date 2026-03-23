import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserTenant, checkUsageLimit, logUsage, checkSubscription } from '@/lib/auth';
import { commentSchema, validateInput, sanitizeHtml, CommentInput } from '@/lib/validation';

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

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

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);

    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const user = await requireAuth();
    const userTenant = await getUserTenant(user.id);

    await checkSubscription(userTenant.tenant_id, 'free');

    const body = await request.json();
    const validatedData: CommentInput = validateInput(commentSchema, body);

    const supabase = await (await import('@/lib/auth')).createClient();

    const { data: design, error: designError } = await supabase
      .from('designs')
      .select('id, user_id, tenant_id, is_public, comment_count')
      .eq('unique_id', validatedData.designId)
      .single();

    if (designError || !design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    if (!design.is_public && design.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await checkUsageLimit(user.id, userTenant.tenant_id, 'create_comment');

    const sanitizedContent = sanitizeHtml(validatedData.content);
    const sanitizedAuthorName = sanitizeHtml(validatedData.authorName);

    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([
        {
          design_id: design.id,
          user_id: user.id,
          tenant_id: userTenant.tenant_id,
          author_name: sanitizedAuthorName,
          author_email: user.email,
          x_percent: validatedData.xPercent,
          y_percent: validatedData.yPercent,
          content: sanitizedContent,
          is_resolved: false,
          is_deleted: false,
        },
      ])
      .select(`
        id,
        design_id,
        author_name,
        x_percent,
        y_percent,
        content,
        is_resolved,
        created_at
      `)
      .single();

    if (commentError) {
      throw new Error(`Failed to create comment: ${commentError.message}`);
    }

    await supabase
      .from('designs')
      .update({ comment_count: (design.comment_count || 0) + 1 })
      .eq('id', design.id);

    await logUsage(user.id, userTenant.tenant_id, 'create_comment', {
      design_id: design.id,
      comment_id: comment.id,
    });

    return NextResponse.json({ 
      success: true, 
      comment: {
        id: comment.id,
        designId: comment.design_id,
        authorName: comment.author_name,
        xPercent: comment.x_percent,
        yPercent: comment.y_percent,
        content: comment.content,
        isResolved: comment.is_resolved,
        createdAt: comment.created_at,
      },
    });
  } catch (error) {
    console.error('Create comment error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message.includes('Subscription tier')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes('Usage limit exceeded')) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }
      if (error.message.includes('Design not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('Access denied')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
