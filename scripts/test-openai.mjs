import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Read API key from .env.local
const envLocal = fs.readFileSync('.env.local', 'utf-8');
const keyMatch = envLocal.match(/OPENAI_API_KEY=(.+)/);
const apiKey = keyMatch ? keyMatch[1].trim() : process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('Testing OpenAI API with key prefix:', apiKey.slice(0, 12) + '...' + apiKey.slice(-6));

const openai = new OpenAI({ apiKey });

async function run() {
  try {
    console.log('1. Checking OpenAI models list...');
    const models = await openai.models.list();
    console.log('Successfully connected to OpenAI! Total models accessible:', models.data.length);
    
    const imageModels = models.data.filter(m => 
      m.id.toLowerCase().includes('image') || 
      m.id.toLowerCase().includes('dall') || 
      m.id.toLowerCase().includes('sunburst') ||
      m.id.toLowerCase().includes('flare')
    );
    console.log('Available Image / Sunburst / DALL-E models:');
    imageModels.forEach(m => console.log(' -', m.id));

    // Also check if gpt-image-2.5-sunburst is in list
    const hasSunburst = models.data.some(m => m.id.includes('sunburst'));
    console.log('Has sunburst model in list?', hasSunburst);
    
  } catch (err) {
    console.error('OpenAI API check error:', err);
  }
}

run();
