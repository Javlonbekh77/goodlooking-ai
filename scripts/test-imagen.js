const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const envContent = fs.readFileSync('.env.local', 'utf-8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
  }
}

const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 60000 } });

async function testModels() {
  const testPrompt = 'Professional studio photograph of a man with a clean high fade haircut, Canon EOS R5 85mm f/1.8';
  
  // Try generateContent with gemini-2.5-flash-image
  console.log('Testing gemini-2.5-flash-image with generateContent...');
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: testPrompt }]
    });
    console.log('gemini-2.5-flash-image success!');
    for (const p of res.candidates[0].content.parts) {
      if (p.inlineData) {
        console.log('Got inline image! size:', p.inlineData.data.length);
        fs.writeFileSync('public/images/test-generated.png', Buffer.from(p.inlineData.data, 'base64'));
        return;
      }
    }
  } catch (e) {
    console.log('gemini-2.5-flash-image failed:', e.message.slice(0, 150));
  }

  // Try imagen-3.0-generate-002 with generateImages
  console.log('Testing imagen-3.0-generate-002 with generateImages...');
  try {
    const res = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: testPrompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
    });
    console.log('imagen-3.0 success! Got images:', res.generatedImages?.length);
  } catch (e) {
    console.log('imagen-3.0 failed:', e.message.slice(0, 150));
  }
}

testModels();
