const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const envContent = fs.readFileSync('.env.local', 'utf-8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
  }
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const userImg = fs.readFileSync('public/images/sample-portrait.jpg').toString('base64');
    const styleImg = fs.readFileSync('public/images/textured-crop.jpg').toString('base64');

    console.log('Sending 2 images to gemini-2.5-flash for 100% detail analysis...');
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: userImg,
          },
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: styleImg,
          },
        },
        {
          text: `Siz professional AI fotorealizm va soch stilisti mutaxassisisiz.
Birinchi rasm: Mijozning asl portreti.
Ikkinchi rasm: Olinishi kerak bo'lgan soch turmagi andozasi (qolip).

Vazifangiz:
1. 1-rasmdagi insonning yuzi, ko'zi, burni, teri rangi, soqoli, kiyimi va fonini 100% tahlil qiling. Bular zarracha ham o'zgarmasligi shart!
2. 2-rasmdagi soch turmagini (fringe, fade, tekstura, hajm) tahlil qiling.
3. Rasm yaratish modeli uchun eng yuqori sifatli (Ultra-detailed 8K Photorealistic) Master Prompt tuzing.
Javobni quyidagi formatda bering:
- Shaxs tahlili (Yuz, kiyim, fon)
- Soch andozasi tahlili
- O'zbekcha batafsil tavsif
- Master English Image Prompt (text-to-image uchun mukammal inglizcha prompt)`,
        },
      ],
    });

    console.log('=== VISION ANALYSIS RESULT ===');
    console.log(res.candidates[0].content.parts[0].text);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
