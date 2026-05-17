export declare class DOMAnalyzer {
    /**
     * Called from Cypress browser context via cy.task().
     * Returns a focused HTML subtree, not the entire page.
     */
    static extractRelevantSubtree(fullPageHTML: string, originalSelector: string, contextDepth?: number): string;
    /**
     * Extract selector "hints" from the original broken selector.
     * e.g. "#submit-btn" → { type: 'id', value: 'submit-btn', hints: ['submit', 'btn'] }
     */
    static parseSelectorHints(selector: string): {
        type: string;
        value: string;
        semanticHints: string[];
    };
}
//# sourceMappingURL=DOMAnalyzer.d.ts.map