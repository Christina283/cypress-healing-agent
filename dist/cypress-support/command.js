"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Cypress.Commands.add('getHealing', (selector, options) => {
    return cy.get('body').then($body => {
        // Try the original selector first
        if ($body.find(selector).length > 0) {
            return cy.get(selector, options); // It works — no healing needed
        }
        // Element missing — invoke the healing agent
        cy.log(`⚠️ Selector failed: "${selector}" — invoking healing agent`);
        const context = {
            originalSelector: selector,
            pageUrl: typeof window !== 'undefined' ? window.location.href : '',
            testTitle: Cypress.currentTest.titlePath.join(' > '),
            domSnapshot: $body.html().slice(0, 8000),
            failureReason: 'element not found in DOM',
        };
        return cy.task('healSelector', context).then(result => {
            if (result.success && result.healedSelector) {
                cy.log(`✅ Healed to: "${result.healedSelector}" via ${result.strategy}`);
                return cy.get(result.healedSelector, options);
            }
            // Healing failed — fall back to original (will throw naturally)
            return cy.get(selector, options);
        });
    });
});
//# sourceMappingURL=command.js.map