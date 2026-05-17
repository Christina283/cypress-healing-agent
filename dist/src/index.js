"use strict";
// src/index.ts — the ONLY file consumers touch
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealingPlugin = exports.HealingRegistry = exports.HealingAgent = void 0;
var HealingAgent_1 = require("./agent/HealingAgent");
Object.defineProperty(exports, "HealingAgent", { enumerable: true, get: function () { return HealingAgent_1.HealingAgent; } });
var HealingRegistry_1 = require("./reporting/HealingRegistry");
Object.defineProperty(exports, "HealingRegistry", { enumerable: true, get: function () { return HealingRegistry_1.HealingRegistry; } });
// Convenience re-export for cypress.config.ts wiring
var plugin_1 = require("../cypress-support/plugin");
Object.defineProperty(exports, "registerHealingPlugin", { enumerable: true, get: function () { return plugin_1.registerHealingPlugin; } });
//# sourceMappingURL=index.js.map