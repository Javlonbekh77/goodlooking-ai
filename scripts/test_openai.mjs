import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import path from 'path';

// Read API key from .env.local or process.env
let apiKey = process.env.OPENAI_API_KEY;
if (!apiKey && fs.existsSync('.env.local')) {
  const envLocal = fs.readFileSync('.env.local', 'utf-8');
  const keyMatch = envLocal.match(/OPENAI_API_KEY=(.+)/);
  if (keyMatch) apiKey = keyMatch[1].trim();
}

const openai = new OpenAI({ apiKey: apiKey || '' });

async function testOpenAi() {
  console.log('Testing OpenAI Images Edit with gpt-image-2.5-sunburst...');

  const img1Buf = fs.readFileSync(path.join(process.cwd(), 'public/images/sample-portrait.jpg'));
  const img2Buf = fs.readFileSync(path.join(process.cwd(), 'public/images/textured-crop.jpg'));

  const file1 = await toFile(img1Buf, 'client.jpg', { type: 'image/jpeg' });
  const file2 = await toFile(img2Buf, 'reference.jpg', { type: 'image/jpeg' });

  const prompt = "Image 1 is the original client photo. Image 2 is exclusively a hairstyle reference. Transfer the hairstyle from Image 2 onto the client in Image 1. Preserve the client's original identity, face, facial features, skin, expression, clothing, pose, background, lighting, and composition. Do not copy the reference person's face or other physical features. Modify only the hair and the minimum necessary hairline transition areas. Match the reference hairstyle as closely as possible while adapting it naturally to the client's head shape. Maintain realistic individual hair strands, natural hair density, believable hairline edges, and consistent lighting. Return one photorealistic edited image.";

  try {
    const res = await openai.images.edit({
      model: 'gpt-image-2.5-sunburst',
      image: [file1, file2],
      prompt: prompt,
      n: 1,
      quality: 'low',
    });

    console.log('SUCCESS! Result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error during OpenAI call:');
    console.error('Status:', err.status);
    console.error('Message:', err.message);
    console.error('Body:', err.error || err);
  }
}

testOpenAi();
