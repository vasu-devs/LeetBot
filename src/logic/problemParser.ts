export interface ProblemDetails {
    title: string;
    description: string;
    difficulty: string;
    examples: string[];
    constraints: string[];
}

export const parseProblem = (): ProblemDetails | null => {
    try {
        // Selectors are based on LeetCode's current DOM structure (subject to change)
        // We try multiple common selectors to be robust

        const titleElement = document.querySelector('[data-cy="question-title"]') ||
            document.querySelector('.text-title-large');
        const title = titleElement?.textContent?.trim() || 'Unknown Problem';

        const descriptionElement = document.querySelector('[data-track-load="description_content"]');
        const description = descriptionElement?.textContent?.trim() || '';

        const difficultyElement = document.querySelector('[diff]'); // Often has a 'diff' attribute
        // Fallback for difficulty if attribute not found
        const difficulty = difficultyElement?.textContent?.trim() || 'Medium';

        // Extract examples (heuristic: look for "Example" text in description or specific blocks)
        // This is a simplified extraction. A real one would parse the HTML structure more carefully.
        const examples: string[] = [];
        const contentHtml = descriptionElement?.innerHTML || '';

        // Simple regex to find example blocks (very basic)
        const exampleMatches = contentHtml.match(/Example \d+:/g);
        if (exampleMatches) {
            // In a real implementation, we'd traverse the DOM to get the content following "Example X:"
            examples.push(`${exampleMatches.length} examples found`);
        }

        return {
            title,
            description,
            difficulty,
            examples,
            constraints: []
        };
    } catch (error) {
        console.error('LeetBot: Failed to parse problem', error);
        return null;
    }
};

export const getUserCode = (): string => {
    // Monaco editor content is hard to grab directly from DOM text.
    // We might need to inspect the Monaco model or copy from the clipboard if we can trigger it.
    // For now, let's try to grab the visible lines.
    const lines = document.querySelectorAll('.view-lines .view-line');
    if (!lines.length) return '';

    return Array.from(lines).map(line => line.textContent).join('\n');
};
