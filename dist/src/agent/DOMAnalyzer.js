"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAnalyzer = void 0;
class DOMAnalyzer {
    /**
     * Called from Cypress browser context via cy.task().
     * Returns a focused HTML subtree, not the entire page.
     */
    static extractRelevantSubtree(fullPageHTML, originalSelector, contextDepth = 3) {
        // Strategy: 
        // 1. Parse the full HTML (use cheerio in Node)
        // 2. Find the closest matching container by tag/class hints from the selector
        // 3. Return only that subtree — Claude's context window is precious
        // For MVP, extract the <body> but strip scripts/styles
        const bodyMatch = fullPageHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (!bodyMatch)
            return fullPageHTML.slice(0, 8000); // hard cap
        const cleaned = bodyMatch[1]
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
        // Cap at 6000 chars — enough for Claude to reason, not wasteful
        return cleaned.slice(0, 6000);
    }
    /**
     * Extract selector "hints" from the original broken selector.
     * e.g. "#submit-btn" → { type: 'id', value: 'submit-btn', hints: ['submit', 'btn'] }
     */
    static parseSelectorHints(selector) {
        const semanticHints = [];
        if (selector.startsWith('#')) {
            const value = selector.slice(1);
            semanticHints.push(...value.split(/[-_]/));
            return { type: 'id', value, semanticHints };
        }
        if (selector.startsWith('.')) {
            const value = selector.slice(1);
            semanticHints.push(...value.split(/[-_]/));
            return { type: 'class', value, semanticHints };
        }
        if (selector.includes('data-')) {
            const match = selector.match(/data-[\w-]+="?([^"'\]]+)"?/);
            return { type: 'data-attribute', value: match?.[1] ?? selector, semanticHints: [match?.[1] ?? ''] };
        }
        return { type: 'unknown', value: selector, semanticHints: [] };
    }
}
exports.DOMAnalyzer = DOMAnalyzer;
//# sourceMappingURL=DOMAnalyzer.js.map