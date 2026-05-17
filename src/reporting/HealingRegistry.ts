import * as fs from 'fs';
import * as path from 'path';
import { AgentConfig, RegistryEntry } from '../types';

export class HealingRegistry {
  private entries: RegistryEntry[];
  private registryPath: string;
  private reportOutputPath: string;

  constructor(config: AgentConfig) {
    this.registryPath = config.registryPath ?? 
      path.resolve(process.cwd(), 'cypress/fixtures/healing-registry.json');
    this.reportOutputPath = config.reportOutputPath ??
      path.resolve(process.cwd(), 'cypress/reports/healing-report.md');
    this.entries = this.load();
  }

  private load(): RegistryEntry[] {
    if (!fs.existsSync(this.registryPath)) return [];
    return JSON.parse(fs.readFileSync(this.registryPath, 'utf-8'));
  }

  lookup(originalSelector: string, pageUrl: string): RegistryEntry | null {
    return this.entries.find(
      e => e.originalSelector === originalSelector && e.pageUrl === pageUrl
    ) ?? null;
  }

  save(entry: RegistryEntry): void {
    const existing = this.entries.findIndex(
      e => e.originalSelector === entry.originalSelector && e.pageUrl === entry.pageUrl
    );
    if (existing >= 0) {
      this.entries[existing] = entry;
    } else {
      this.entries.push(entry);
    }
    // Ensure directory exists before writing
    const dir = path.dirname(this.registryPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.registryPath, JSON.stringify(this.entries, null, 2));
  }

  incrementUsage(originalSelector: string, pageUrl: string): void {
    const entry = this.lookup(originalSelector, pageUrl);
    if (entry) {
      entry.usageCount++;
      this.save(entry);
    }
  }

  getAllEntries(): RegistryEntry[] {
    return [...this.entries];
  }

  // ── Reporting ────────────────────────────────────────────────────

  generateReport(): string {
    const timestamp = new Date().toISOString();
    const lines = [
      '# 🔧 Self-Healing Selector Report',
      `**Generated:** ${timestamp}`,
      `**Total healed selectors:** ${this.entries.length}`,
      '',
      '| Original Selector | Healed Selector | Strategy | Confidence | Test | Uses |',
      '|---|---|---|---|---|---|',
      ...this.entries.map(e =>
        `| \`${e.originalSelector}\` | \`${e.healedSelector}\` | ${e.strategy} | ${(e.confidence * 100).toFixed(0)}% | ${e.testTitle} | ${e.usageCount} |`
      ),
    ];
    return lines.join('\n');
  }

  writeReport(outputPath?: string): void {
    const target = outputPath ?? this.reportOutputPath;
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, this.generateReport(), 'utf-8');
    console.log(`📋 [HealingRegistry] Report written → ${target}`);
  }

  printSummary(): void {
    if (this.entries.length === 0) return;
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