// Test the Next.js API /api/generate-hairstyle end-to-end
import fs from 'fs';
import path from 'path';

async function testEndToEnd() {
  console.log('Sending request to http://localhost:3000/api/generate-hairstyle ...');

  const clientBuf = fs.readFileSync(path.join(process.cwd(), 'public/images/sample-portrait.jpg'));
  const clientBase64 = `data:image/jpeg;base64,${clientBuf.toString('base64')}`;

  const payload = {
    image: clientBase64,
    hairstyleId: 'textured-crop', // Presets to /images/textured-crop.jpg
    customNotes: 'natural hair texture, sharp edges'
  };

  const startTime = Date.now();
  const res = await fetch('http://localhost:3000/api/generate-hairstyle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Response received in ${duration}s. Status:`, res.status, res.statusText);

  const data = await res.json();
  if (data.success && data.image) {
    console.log('SUCCESS!');
    console.log('Model:', data.model);
    console.log('Usage:', JSON.stringify(data.usage));
    console.log('Image length:', data.image.length);
    console.log('Image starts with:', data.image.substring(0, 50));

    // Save the output image locally for inspection
    if (data.image.startsWith('data:')) {
      const base64Data = data.image.split(',')[1];
      fs.writeFileSync(path.join(process.cwd(), 'test_openai_result.png'), Buffer.from(base64Data, 'base64'));
      console.log('Saved generated image to test_openai_result.png');
    }
  } else {
    console.error('FAILED! Error details:', data);
  }
}

testEndToEnd().catch(console.error);
