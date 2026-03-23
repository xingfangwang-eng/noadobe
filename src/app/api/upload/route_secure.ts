import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/storage';
import { requireAuth, getUserTenant, checkUsageLimit, logUsage, checkSubscription } from '@/lib/auth';
import { validateInput, uploadSchema, sanitizeFileName, generateUniqueId } from '@/lib/validation';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

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

    await checkUsageLimit(user.id, userTenant.tenant_id, 'upload_design');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    validateInput(uploadSchema, { file });

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const sanitizedFileName = sanitizeFileName(file.name);
    const uniqueId = generateUniqueId();
    const fileExt = sanitizedFileName.split('.').pop();
    const fileName = `${uniqueId}.${fileExt}`;

    const path = await uploadImage(file);

    const supabase = await (await import('@/lib/auth')).createClient();

    const { data: design, error } = await supabase
      .from('designs')
      .insert([
        {
          user_id: user.id,
          tenant_id: userTenant.tenant_id,
          unique_id: uniqueId,
          file_path: path,
          file_name: sanitizedFileName,
          file_size: file.size,
          file_type: file.type,
          is_public: false,
        },
      ])
      .select('id, unique_id, file_path, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create design record: ${error.message}`);
    }

    await logUsage(user.id, userTenant.tenant_id, 'upload_design', {
      file_size: file.size,
      file_type: file.type,
      design_id: design.id,
    });

    return NextResponse.json({
      success: true,
      design: {
        id: design.id,
        uniqueId: design.unique_id,
        path: design.file_path,
        createdAt: design.created_at,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);

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
    }

    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
