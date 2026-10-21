import fs from 'fs';

// Read FAL_KEY from process.env or .env.local
let FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY && fs.existsSync('.env.local')) {
  const envLocal = fs.readFileSync('.env.local', 'utf-8');
  const match = envLocal.match(/FAL_KEY=(.+)/);
  if (match) FAL_KEY = match[1].trim();
}

async function testFal() {
  console.log('Testing fal-ai/image-editing/hair-change...');
  const testImageUrl = 'https://v3.fal.media/files/zebra/hAjCkcyly4gsS9-cptD3Y_image%20(20).png';

  const body = {
    image_url: testImageUrl,
    prompt: 'sharp fade haircut with modern textured crop on top',
    guidance_scale: 3.5,
    num_inference_steps: 30,
    safety_tolerance: '2',
    output_format: 'jpeg'
  };

  console.log('Submitting request to https://queue.fal.run/fal-ai/image-editing/hair-change ...');
  const res = await fetch('https://queue.fal.run/fal-ai/image-editing/hair-change', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  console.log('Status:', res.status, res.statusText);
  const data = await res.json();
  console.log('Response data:', JSON.stringify(data, null, 2));

  if (data.status_url && data.response_url) {
    console.log('Polling queue status...');
    let completed = false;
    let attempts = 0;
    while (!completed && attempts < 30) {
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
      const statusRes = await fetch(data.status_url, {
        headers: { 'Authorization': `Key ${FAL_KEY}` }
      });
      const statusData = await statusRes.json();
      console.log(`Poll ${attempts}: status =`, statusData.status);
      if (statusData.status === 'COMPLETED') {
        completed = true;
        const resultRes = await fetch(data.response_url, {
          headers: { 'Authorization': `Key ${FAL_KEY}` }
        });
        const resultData = await resultRes.json();
        console.log('Final result:', JSON.stringify(resultData, null, 2));
      } else if (statusData.status === 'FAILED') {
        console.error('Queue failed:', statusData);
        break;
      }
    }
  }
}

testFal().catch(console.error);
