import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const fotorKey = process.env.FOTOR_API_KEY?.trim() || '';

  try {
    const res = await fetch('https://api-b.fotor.com/v1/credits', {
      headers: {
        Authorization: `Bearer ${fotorKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        connected: true,
        apiKeyMasked: `${fotorKey.slice(0, 7)}...${fotorKey.slice(-4)}`,
        businessId: data?.data?.businessId || '76cd1ee7f7d7451facc9f7ad004a8af3',
        totalCredits: data?.data?.total ?? 0,
        remainingCredits: data?.data?.remaining ?? 0,
        raw: data,
      });
    }

    return NextResponse.json({
      success: false,
      connected: false,
      error: `Fotor API HTTP ${res.status}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Ulanish xatosi';
    return NextResponse.json({
      success: false,
      connected: false,
      error: msg,
    });
  }
}
