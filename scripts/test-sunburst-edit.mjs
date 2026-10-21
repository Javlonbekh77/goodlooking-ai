import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import path from 'path';

// Read API key from .env.local
const envLocal = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envLocal.match(/OPENAI_API_KEY=(.+)/);
const apiKey = keyMatch ? keyMatch[1].trim() : process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

async function testImageEdit() {
  console.log('Testing gpt-image-2.5-sunburst image edit with 2 images...');
  
  const img1Buf = fs.readFileSync('public/images/sample-portrait.jpg');
  const img2Buf = fs.readFileSync('public/images/textured-crop.jpg');

  const file1 = await toFile(img1Buf, 'client.jpg', { type: 'image/jpeg' });
  const file2 = await toFile(img2Buf, 'reference.jpg', { type: 'image/jpeg' });

  const prompt = "Image 1 is the original client photo. Image 2 is exclusively a hairstyle reference. Transfer the hairstyle from Image 2 onto the client in Image 1. Preserve the client's original identity, face, facial features, skin, expression, clothing, pose, background, lighting, and composition. Do not copy the reference person's face or other physical features. Modify only the hair and the minimum necessary hairline transition areas. Match the reference hairstyle as closely as possible while adapting it naturally to the client's head shape. Maintain realistic individual hair strands, natural hair density, believable hairline edges, and consistent lighting. Return one photorealistic edited image.";

  const startTime = Date.now();
  console.log('Calling openai.images.edit...');
  
  const response = await openai.images.edit({
    model: 'gpt-image-2.5-sunburst',
    image: [file1, file2],
    prompt: prompt,
    n: 1,
    quality: 'low',
    output_format: 'jpeg'
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Success in ${duration}s! Response:`, {
    created: response.created,
    dataCount: response.data?.length,
    hasB64: Boolean(response.data?.[0]?.b64_json),
    hasUrl: Boolean(response.data?.[0]?.url),
    usage: response.usage
  });

  if (response.data?.[0]?.b64_json) {
    const b64 = response.data[0].b64_json;
    fs.writeFileSync('test_openai_output.jpg', Buffer.from(b64, 'base64'));
    console.log('Saved test_openai_output.jpg successfully! Size:', Math.round(b64.length * 0.75 / 1024), 'KB');
  } else if (response.data?.[0]?.url) {
    console.log('Image URL:', response.data[0].url);
  }
}

testImageEdit().catch((err) => {
  console.error('Test error:', err);
});
