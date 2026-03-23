import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designId, xPercent, yPercent, authorName, content } = body;

    if (!designId || xPercent === undefined || yPercent === undefined || !authorName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          design_id: designId,
          x_percent: xPercent,
          y_percent: yPercent,
          author_name: authorName,
          content,
          is_resolved: false,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    return NextResponse.json({ success: true, comment: data });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}