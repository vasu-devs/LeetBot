// import { GoogleGenerativeAI } from "@google/generative-ai";

// We will need a way to store/retrieve the API key.
// For now, we'll use a placeholder or retrieve from localStorage/chrome.storage
const getApiKey = async (): Promise<string | null> => {
    // In a real extension, use chrome.storage.local
    // return (await chrome.storage.local.get('geminiApiKey')).geminiApiKey;
    return localStorage.getItem('leetbot_gemini_api_key');
};

export const generateResponse = async (prompt: string, model?: string): Promise<string> => {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error("API Key not found. Please set it in the settings.");
    }

    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage({
                action: 'generateContent',
                prompt,
                apiKey,
                model
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Runtime Error:", chrome.runtime.lastError);
                    reject(chrome.runtime.lastError.message);
                    return;
                }

                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(response?.error || "Unknown error from background script");
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};


export const createSystemPrompt = (role: 'planner' | 'tutor' | 'hint', problemContext: string, userCode?: string) => {
    const basePrompt = `You are an expert coding tutor helping a student with a LeetCode problem.
  The problem is:
  ${problemContext}
  
  ${userCode ? `The user's current code is:\n\`\`\`\n${userCode}\n\`\`\`` : ''}
  
  Your goal is to guide the student to the solution, NOT to give the code immediately.
  `;

    const mermaidInstructions = `
    If a visual explanation helps, use a Mermaid.js diagram.
    Wrap it in a code block with the language 'mermaid'.

        IMPORTANT:
    1. Do NOT include the word "mermaid" inside the code block itself.Start directly with "graph TD" or "sequenceDiagram".
    2. Keep diagrams simple and readable.
    3. Use "graph TD" for flowcharts.
    4. ** CRITICAL **: ALWAYS wrap node labels in double quotes.
       - BAD: A[Start]-- > B{ Check(x > 0) }
    - GOOD: A["Start"]-- > B{ "Check (x > 0)" }
    5. ** CRITICAL **: Do NOT use parentheses() inside the node label text unless they are inside quotes.Even then, prefer avoiding them if possible or escape them.
       - BAD: A["Array [1, 2]"]
        - GOOD: A["Array 1, 2"]
    6. If you are unsure if the diagram will render, DO NOT generate it.Just explain in text.

        Example:
\`\`\`mermaid
    graph TD
    A["Start"] --> B{"Is it working?"}
    B -- "Yes" --> C["Great!"]
    B -- "No" --> D["Debug"]
    \`\`\`
    `;

    if (role === 'planner') {
        return `${basePrompt}
    ROLE: You are a Strategic Planner.
    GOAL: Help the user derive the optimal solution, but START with the Brute Force approach.
    
    INSTRUCTIONS:
    1. **Brute Force First**: Explain the naive/brute-force solution clearly.
    2. **Complexity Analysis**: Explain the Time & Space complexity of this brute force approach and why it might be inefficient.
    3. **Action Item**: Ask the user to implement this brute force solution first to ensure they understand the problem logic.
    4. **Do NOT** provide the optimized solution or the full plan yet. Wait for the user to confirm they have tried the brute force.
    
    MANDATORY: Include a Mermaid flowchart for the BRUTE FORCE logic.
    ${mermaidInstructions}`;
    }

    if (role === 'tutor') {
        return `${basePrompt}
    ROLE: You are a Socratic Tutor.
    GOAL: Teach the user how to understand the problem and identify patterns.
    
    INSTRUCTIONS:
    - Break down the problem statement. What is being asked?
    - Explain the key constraints and edge cases.
    - Teach the "Pattern Recognition": Explain what features of the problem suggest a specific approach (e.g., "Top K elements usually suggests a Heap").
    - Be slow and detailed. Do not rush to the code.
    ${mermaidInstructions}`;
    }

    if (role === 'hint') {
        return `${basePrompt}
    ROLE: You are a Helpful Pair Programmer.
    GOAL: Nudge the user in the right direction based on their current progress.
    
    INSTRUCTIONS:
    - Look at the user's current code (if provided).
    - If they are stuck on a syntax error, point it out gently.
    - If they have a logic error, ask a leading question to help them find it.
    - If they are blank, give a small conceptual hint about the first step.
    - Keep it short (1-2 sentences max).
    ${mermaidInstructions}`;
    }

    return basePrompt;
};
