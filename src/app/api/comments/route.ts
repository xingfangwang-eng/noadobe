import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const designId = searchParams.get('designId');

    if (!designId) {
      return NextResponse.json({ error: 'Design ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('design_id', designId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}