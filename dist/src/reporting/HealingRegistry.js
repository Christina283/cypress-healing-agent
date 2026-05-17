"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealingRegistry = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class HealingRegistry {
    constructor(config) {
        this.registryPath = config.registryPath ??
            path.resolve(process.cwd(), 'cypress/fixtures/healing-registry.json');
        this.reportOutputPath = config.reportOutputPath ??
            path.resolve(process.cwd(), 'cypress/reports/healing-report.md');
        this.entries = this.load();
    }
    load() {
        if (!fs.existsSync(this.registryPath))
            return [];
        return JSON.parse(fs.readFileSync(this.registryPath, 'utf-8'));
    }
    lookup(originalSelector, pageUrl) {
        return this.entries.find(e => e.originalSelector === originalSelector && e.pageUrl === pageUrl) ?? null;
    }
    save(entry) {
        const existing = this.entries.findIndex(e => e.originalSelector === entry.originalSelector && e.pageUrl === entry.pageUrl);
        if (existing >= 0) {
            this.entries[existing] = entry;
        }
        else {
            this.entries.push(entry);
        }
        // Ensure directory exists before writing
        const dir = path.dirname(this.registryPath);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.registryPath, JSON.stringify(this.entries, null, 2));
    }
    incrementUsage(originalSelector, pageUrl) {
        const entry = this.lookup(originalSelector, pageUrl);
        if (entry) {
            entry.usageCount++;
            this.save(entry);
        }
    }
    getAllEntries() {
        return [...this.entries];
    }
    // ── Reporting ────────────────────────────────────────────────────
    generateReport() {
        const timestamp = new Date().toISOString();
        const lines = [
            '# 🔧 Self-Healing Selector Report',
            `**Generated:** ${timestamp}`,
            `**Total healed selectors:** ${this.entries.length}`,
            '',
            '| Original Selector | Healed Selector | Strategy | Confidence | Test | Uses |',
            '|---|---|---|---|---|---|',
            ...this.entries.map(e => `| \`${e.originalSelector}\` | \`${e.healedSelector}\` | ${e.strategy} | ${(e.confidence * 100).toFixed(0)}% | ${e.testTitle} | ${e.usageCount} |`),
        ];
        return lines.join('\n');
    }
    writeReport(outputPath) {
        const target = outputPath ?? this.reportOutputPath;
        const dir = path.dirname(target);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(target, this.generateReport(), 'utf-8');
        console.log(`📋 [HealingRegistry] Report written → ${target}`);
    }
    printSummary() {
        if (this.entries.length === 0)
            return;
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  🔧 Self-Healing Agent — Run Summary');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.entries.forEach(e => {
            console.log(`  ${e.originalSelector}`);
            console.log(`    → ${e.healedSelector} (${e.strategy}, ${(e.confidence * 100).toFixed(0)}%)`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
}
exports.HealingRegistry = HealingRegistry;
//# sourceMappingURL=HealingRegistry.js.map