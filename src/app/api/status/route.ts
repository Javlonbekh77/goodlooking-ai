import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const isConfigured = Boolean(openaiKey);

  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.5-sunburst';

  return NextResponse.json({
    configured: isConfigured,
    model: model,
    quality: process.env.OPENAI_IMAGE_QUALITY || 'low',
  });
}
