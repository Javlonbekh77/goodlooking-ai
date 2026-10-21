// Test http://localhost:3000/api/generate-hairstyle directly
async function testEndpoint() {
  console.log('Testing /api/generate-hairstyle endpoint...');
  const res = await fetch('http://localhost:3000/api/generate-hairstyle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: '/images/sample-portrait.jpg',
      hairstyleId: 'textured-fade-pompadour',
      customNotes: 'qora tabiiy soch'
    })
  });

  console.log('HTTP Status:', res.status, res.statusText);
  const data = await res.json();
  console.log('Endpoint Response:', JSON.stringify(data, null, 2));

  // Check that original image is NEVER falsely returned
  if (data.image === '/images/sample-portrait.jpg') {
    console.error('FAIL: Original image was returned as generated result!');
  } else {
    console.log('SUCCESS: Original image was NOT returned as fake result.');
  }
}

testEndpoint().catch(console.error);
