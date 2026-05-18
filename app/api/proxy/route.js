import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    return NextResponse.json({ base64 });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
