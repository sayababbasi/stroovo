import { ollamaClient } from './ollama';

async function testOllamaConnection() {
  console.log('Testing Ollama connection...\n');

  try {
    const models = await ollamaClient.listModels();
    console.log('Available models:', models.map((m: any) => m.name).join(', '));

    const testPrompt = 'Respond with "Hello from Ollama"';

    console.log('\nTesting qwen2.5-coder:1.5b...');
    const qwenResponse = await ollamaClient.generate(testPrompt, 'qwen2.5-coder:1.5b', {
      temperature: 0.1,
      max_tokens: 50,
    });
    console.log('qwen2.5-coder response:', qwenResponse.response);

    console.log('\nTesting phi3:mini...');
    const phiResponse = await ollamaClient.generate(testPrompt, 'phi3:mini', {
      temperature: 0.1,
      max_tokens: 50,
    });
    console.log('phi3:mini response:', phiResponse.response);

    console.log('\nConnection test successful!');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

if (require.main === module) {
  testOllamaConnection();
}

export { testOllamaConnection };
