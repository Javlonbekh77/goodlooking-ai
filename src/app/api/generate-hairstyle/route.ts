import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { HAIRSTYLES } from '@/data/hairstyles';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90; // Up to 90 seconds for OpenAI model processing

// Helper: Convert local public path, remote URL, or Base64 to an OpenAI Uploadable File
async function resolveImageToUploadable(input: string, fallbackName: string): Promise<File> {
  if (!input || typeof input !== 'string') {
    throw new Error('Rasm maʼlumoti bo‘sh');
  }

  // 1. Data URI (data:image/jpeg;base64,...)
  if (input.startsWith('data:')) {
    const matches = input.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
      return await toFile(buffer, `${fallbackName}.${ext}`, { type: mime });
    }
  }

  // 2. Local public path: '/images/textured-crop.jpg'
  if (input.startsWith('/')) {
    const filePath = path.join(process.cwd(), 'public', input.replace(/^\//, ''));
    try {
      const buffer = await fs.readFile(filePath);
      const mime = input.toLowerCase().endsWith('.png')
        ? 'image/png'
        : input.toLowerCase().endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
      const ext = input.toLowerCase().endsWith('.png') ? 'png' : input.toLowerCase().endsWith('.webp') ? 'webp' : 'jpg';
      return await toFile(buffer, `${fallbackName}.${ext}`, { type: mime });
    } catch {
      throw new Error(`Mahalliy qolip rasmi topilmadi: ${input}`);
    }
  }

  // 3. Remote URL
  if (input.startsWith('http://') || input.startsWith('https://')) {
    const res = await fetch(input, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      throw new Error(`Masofaviy rasmni yuklab bo‘lmadi (${res.status}): ${input}`);
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    return await toFile(buffer, `${fallbackName}.${ext}`, { type: contentType });
  }

  // 4. Raw base64 string fallback
  const buffer = Buffer.from(input, 'base64');
  return await toFile(buffer, `${fallbackName}.jpg`, { type: 'image/jpeg' });
}

// Build standard prompt according to prompt123 specifications
function buildOpenAiHairPrompt(customNotes?: string, customPrompt?: string): string {
  const baseInstruction =
    "Image 1 is the original client photo. Image 2 is exclusively a hairstyle reference. Transfer the hairstyle from Image 2 onto the client in Image 1. Preserve the client's original identity, face, facial features, skin, expression, clothing, pose, background, lighting, and composition. Do not copy the reference person's face or other physical features. Modify only the hair and the minimum necessary hairline transition areas. Match the reference hairstyle as closely as possible while adapting it naturally to the client's head shape. Maintain realistic individual hair strands, natural hair density, believable hairline edges, and consistent lighting. Return one photorealistic edited image.";

  let prompt = baseInstruction;
  if (customNotes?.trim()) {
    prompt += ` Client custom preferences: ${customNotes.trim()}.`;
  }
  if (customPrompt?.trim()) {
    prompt += ` Specific haircut requirements: ${customPrompt.trim()}.`;
  }
  return prompt;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY?.trim() || '';

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          code: 'MISSING_OPENAI_KEY',
          error:
            'OPENAI_API_KEY serverda sozlanmagan. Iltimos, .env.local faylida OPENAI_API_KEY kalitini kiriting.',
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawClientImage: string = body.image || body.userImage || '';
    const hairstyleId: string = body.hairstyleId || '';
    const rawReferenceImage: string = body.referenceImage || '';
    const customNotes: string = body.customNotes || '';
    const customPrompt: string = body.customPrompt || '';

    // Validate client photo
    if (!rawClientImage) {
      return NextResponse.json(
        { success: false, error: 'Iltimos, avval mijoz portret rasmini yuklang.' },
        { status: 400 }
      );
    }

    // Determine reference image:
    // Option A: User uploaded their own custom hairstyle template (referenceImage)
    // Option B: User picked a preset hairstyle (hairstyleId -> HAIRSTYLES[...].imageUrl)
    let referenceImageSource = rawReferenceImage;
    if (!referenceImageSource && hairstyleId) {
      const preset = HAIRSTYLES.find((h) => h.id === hairstyleId);
      if (preset?.imageUrl) {
        referenceImageSource = preset.imageUrl;
      }
    }

    // Default fallback to first hairstyle if neither is provided
    if (!referenceImageSource) {
      referenceImageSource = HAIRSTYLES[0].imageUrl;
    }

    // Prepare Uploadable Files for OpenAI
    let clientFile: File;
    let referenceFile: File;

    try {
      clientFile = await resolveImageToUploadable(rawClientImage, 'client_photo');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Noto‘g‘ri format';
      return NextResponse.json(
        { success: false, error: `Mijoz portretini yuklashda xatolik: ${msg}` },
        { status: 400 }
      );
    }

    try {
      referenceFile = await resolveImageToUploadable(referenceImageSource, 'hairstyle_reference');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Noto‘g‘ri format';
      return NextResponse.json(
        { success: false, error: `Soch qolipi rasmini yuklashda xatolik: ${msg}` },
        { status: 400 }
      );
    }

    // Configure model parameters (cost-effective defaults, configurable via environment)
    const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.5-sunburst';
    const quality = (process.env.OPENAI_IMAGE_QUALITY as 'low' | 'medium' | 'high') || 'low';
    const prompt = buildOpenAiHairPrompt(customNotes, customPrompt);

    console.log(`[openai/images.edit] Invoking ${model} with 2 images (client + hairstyle reference). Quality: ${quality}`);

    const openai = new OpenAI({ apiKey });

    // Call official OpenAI Images edit endpoint
    const response = await openai.images.edit({
      model: model,
      image: [clientFile, referenceFile],
      prompt: prompt,
      n: 1,
      quality: quality,
      output_format: 'jpeg',
    });

    const generatedItem = response.data?.[0];
    if (!generatedItem) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI natijaviy rasm qaytarmadi.',
        },
        { status: 502 }
      );
    }

    let finalImageUrl: string;
    if (generatedItem.b64_json) {
      finalImageUrl = `data:image/jpeg;base64,${generatedItem.b64_json}`;
    } else if (generatedItem.url) {
      finalImageUrl = generatedItem.url;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI rasm formati topilmadi (b64_json yoki url yo‘q).',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      image: finalImageUrl,
      model: model,
      usage: (response as any).usage,
      debugPrompt: prompt,
    });
  } catch (err: any) {
    console.error('[openai/images.edit] API Error:', err);

    // Differentiate OpenAI error types
    const status = err?.status || 500;
    const errorBody = err?.error || {};
    const errorCode = errorBody?.code || err?.code;
    const errorMsg = errorBody?.message || err?.message || 'Nomaʼlum OpenAI xatosi';

    if (status === 401) {
      return NextResponse.json(
        {
          success: false,
          code: 'OPENAI_AUTH_ERROR',
          error: 'OpenAI API kaliti noto‘g‘ri yoki ruxsat etilmagan. Iltimos, .env.local dagi OPENAI_API_KEY ni tekshiring.',
          detail: errorMsg,
        },
        { status: 401 }
      );
    }

    if (status === 429) {
      return NextResponse.json(
        {
          success: false,
          code: 'OPENAI_QUOTA_ERROR',
          error: 'OpenAI balansingiz tugagan yoki limitga yetildi (Insufficient quota / Rate limit). Iltimos, platform.openai.com/billing da hisobni to‘ldiring.',
          detail: errorMsg,
        },
        { status: 429 }
      );
    }

    if (status === 400) {
      return NextResponse.json(
        {
          success: false,
          code: 'OPENAI_BAD_REQUEST',
          error: `OpenAI so‘rov xatosi: ${errorMsg}`,
          detail: errorMsg,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: 'OPENAI_SERVER_ERROR',
        error: `Generatsiya amalga oshmadi: ${errorMsg}`,
        detail: errorMsg,
      },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
