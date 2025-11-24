import { GoogleGenerativeAI } from "@google/generative-ai";

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'generateContent') {
        const { prompt, apiKey, model } = request;

        if (!apiKey) {
            sendResponse({ success: false, error: "API Key is missing" });
            return true;
        }

        (async () => {
            // If a specific model is requested, try only that one.
            // Otherwise, try the fallback list.
            const modelsToTry = model && model !== 'auto' 
                ? [model] 
                : ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
            
            let lastError = null;

            for (const modelName of modelsToTry) {
                try {
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const modelInstance = genAI.getGenerativeModel({ model: modelName });

                    const result = await modelInstance.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    sendResponse({ success: true, data: text, model: modelName });
                    return; // Success, exit loop and function
                } catch (error: any) {
                    console.warn(`Failed with model ${modelName}:`, error);
                    lastError = error;
                    // Continue to next model
                }
            }

            // If we get here, all models failed
            console.error("All models failed. Last error:", lastError);
            sendResponse({
                success: false,
                error: lastError?.message || "All models failed to generate content."
            });
        })();

        return true; // Keep the message channel open for async response
    }
});
