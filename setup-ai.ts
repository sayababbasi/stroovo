import { ollamaClient } from './src/ai/ollama';

async function setupStroovoAI() {
    const models = [
        "qwen2.5:7b",
        "deepseek-coder:6.7b",
        "llama3.2:3b",
        "phi3:mini"
    ];

    console.log("🚀 Starting Stroovo AI Assistant V3 Setup...");
    
    for (const model of models) {
        console.log(`Checking model: ${model}...`);
        const available = await ollamaClient.isModelAvailable(model);
        
        if (!available) {
            console.log(`📥 Model ${model} not found. Pulling now... (This may take a while)`);
            try {
                await ollamaClient.pullModel(model);
                console.log(`✅ Successfully pulled ${model}`);
            } catch (e) {
                console.error(`❌ Failed to pull ${model}. Make sure Ollama is running.`);
            }
        } else {
            console.log(`✅ Model ${model} is already available.`);
        }
    }

    console.log("✨ Stroovo AI Workforce Operating System is ready.");
}

setupStroovoAI();
