import { BrokenSelectorContext, HealingResult } from '../src/types';

Cypress.Commands.add(
  'getHealing',
  (selector: string, options?: Partial<Cypress.Timeoutable>) => {
    return cy.get('body').then($body => {
      // Try the original selector first
      if ($body.find(selector).length > 0) {
        return cy.get(selector, options); // It works — no healing needed
      }

      // Element missing — invoke the healing agent
      cy.log(`⚠️ Selector failed: "${selector}" — invoking healing agent`);

      const context: BrokenSelectorContext = {
        originalSelector: selector,
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        testTitle: Cypress.currentTest.titlePath.join(' > '),
        domSnapshot: $body.html().slice(0, 8000),
        failureReason: 'element not found in DOM',
      };

      return cy.task<HealingResult>('healSelector', context).then(result => {
        if (result.success && result.healedSelector) {
          cy.log(`✅ Healed to: "${result.healedSelector}" via ${result.strategy}`);
          return cy.get(result.healedSelector, options);
        }
        // Healing failed — fall back to original (will throw naturally)
        return cy.get(selector, options);
      });
    });
  }
);

// Extend Cypress types
declare global {
  namespace Cypress {
    interface Chainable {
      getHealing(selector: string, options?: Partial<Timeoutable>): Chainable<JQuery>;
    }
  }
}