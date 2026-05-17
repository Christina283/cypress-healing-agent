declare global {
    namespace Cypress {
        interface Chainable {
            getHealing(selector: string, options?: Partial<Timeoutable>): Chainable<JQuery>;
        }
    }
}
export {};
//# sourceMappingURL=command.d.ts.map