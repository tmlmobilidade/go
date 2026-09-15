/* * */

import { Logger } from '@tmlmobilidade/logger';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { type MetricLogEntry, METRICS_ANALYSIS_FOLDER, METRICS_LOG_FILE } from './log-metric-to-file.js';

/* * */

interface MetricLogEntryWithRuntime extends MetricLogEntry {
	runtimeMs: number
}

interface ApproachStats {
	count: number
	description: string
	totalTime: number
}

interface GroupStats {
	metrics: MetricLogEntryWithRuntime[]
	totalMs: number
	totalQueries: number
}

/* * */

export const METRICS_SUMMARY_FILE = 'summary.md';

/* * */

/**
 * Parses a runtime string such as `1m 20s 300ms` into milliseconds.
 * @param runtimeStr The runtime string produced by the Timer
 */
function parseRuntimeToMs(runtimeStr: string): number {
	let totalMs = 0;

	const minMatch = runtimeStr.match(/(\d+)m(?!\w)/);
	if (minMatch) totalMs += Number.parseInt(minMatch[1]) * 60 * 1000;

	const secMatch = runtimeStr.match(/(\d+)s(?![\w])/);
	if (secMatch) totalMs += Number.parseInt(secMatch[1]) * 1000;

	const msMatch = runtimeStr.match(/(\d+)ms/);
	if (msMatch) totalMs += Number.parseInt(msMatch[1]);

	return totalMs;
}

/**
 * Formats a duration in milliseconds into a human readable string.
 * @param ms The duration in milliseconds
 */
function formatMs(ms: number): string {
	const hours = Math.floor(ms / (60 * 60 * 1000));
	const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
	const seconds = Math.floor((ms % (60 * 1000)) / 1000);
	const milliseconds = ms % 1000;

	let result = '';
	if (hours > 0) result += `${hours}h `;
	if (minutes > 0) result += `${minutes}m `;
	if (seconds > 0) result += `${seconds}s `;
	if (milliseconds > 0) result += `${milliseconds}ms`;

	return result.trim() || '0ms';
}

/**
 * Extracts the group of a demand metric name (e.g. `agency` from `demand_by_agency_by_day`).
 * @param metricName The metric name
 */
function extractMetricGroup(metricName: string): null | string {
	const match = metricName.match(/^demand_by_(.+)_by_(day|month|year)$/);
	return match ? match[1] : null;
}

/* * */

/**
 * Reads the `analysis/metrics-performance.json` file of the current working directory
 * and writes a Markdown summary of the recorded metric runs next to it.
 * @returns The path of the written summary file, or nothing if the metrics file is missing or invalid
 */
export function generatePerformanceSummary(): string | undefined {
	//

	//
	// Load the metrics file

	const analysisDir = join(process.cwd(), METRICS_ANALYSIS_FOLDER);
	const metricsFile = join(analysisDir, METRICS_LOG_FILE);
	const outputFile = join(analysisDir, METRICS_SUMMARY_FILE);

	if (!existsSync(metricsFile)) {
		Logger.info({ message: `Metrics file does not exist: ${metricsFile}` });
		return;
	}

	let metricsData: unknown;
	try {
		metricsData = JSON.parse(readFileSync(metricsFile, 'utf8'));
	} catch (error) {
		Logger.error({ error, message: `Error parsing metrics JSON: ${metricsFile}` });
		return;
	}

	if (!Array.isArray(metricsData)) {
		Logger.error({ message: `Metrics file must contain an array: ${metricsFile}` });
		return;
	}

	const metricsEntries = metricsData as MetricLogEntry[];

	//
	// Prepare the Markdown header

	let markdownContent = `# Performance Metrics Analysis

**Generated:** ${new Date().toISOString()}
**Source File:** \`${metricsFile}\`
**Total Metrics:** ${metricsEntries.length}

---

`;

	//
	// Aggregate totals, approaches and groups

	let totalMs = 0;
	let totalQueries = 0;

	const approaches = new Map<string, ApproachStats>();
	const groupStats = new Map<string, GroupStats>();

	metricsEntries.forEach((metric) => {
		const runtimeMs = parseRuntimeToMs(metric.runtime);
		totalMs += runtimeMs;
		totalQueries += metric.queryCount || 0;

		// Group by approach
		if (metric.approach?.key) {
			const key = metric.approach.key;
			if (!approaches.has(key)) {
				approaches.set(key, {
					count: 0,
					description: metric.approach.description,
					totalTime: 0,
				});
			}
			const approach = approaches.get(key);
			if (approach) {
				approach.count++;
				approach.totalTime += runtimeMs;
			}
		}

		// Group by metric group
		const group = extractMetricGroup(metric.metric);
		if (group) {
			if (!groupStats.has(group)) {
				groupStats.set(group, {
					metrics: [],
					totalMs: 0,
					totalQueries: 0,
				});
			}
			const stats = groupStats.get(group);
			if (stats) {
				stats.metrics.push({ ...metric, runtimeMs });
				stats.totalMs += runtimeMs;
				stats.totalQueries += metric.queryCount || 0;
			}
		}
	});

	//
	// Summary section

	markdownContent += `## 📊 Summary

- **🕒 Total Runtime:** ${formatMs(totalMs)}
- **📏 Milliseconds:** ${totalMs.toLocaleString()}ms
- **📏 Seconds:** ${(totalMs / 1000).toFixed(1)}s
- **📏 Minutes:** ${(totalMs / 60000).toFixed(1)}m
- **📏 Hours:** ${(totalMs / 3600000).toFixed(2)}h
- **🔍 Total Queries:** ${totalQueries.toLocaleString()}

---

`;

	//
	// Group analysis

	if (groupStats.size > 0) {
		markdownContent += `## 🏷️ Metric Groups (sorted by total runtime)\n\n`;

		const sortedGroups = [...groupStats.entries()].sort((a, b) => b[1].totalMs - a[1].totalMs);

		for (const [group, stats] of sortedGroups) {
			const avgMs = stats.totalMs / stats.metrics.length;
			const sorted = [...stats.metrics].sort((a, b) => b.runtimeMs - a.runtimeMs);

			markdownContent += `### Group: \`${group}\`\n`;
			markdownContent += `- **Total metrics:** ${stats.metrics.length}\n`;
			markdownContent += `- **Total runtime:** ${formatMs(stats.totalMs)}\n`;
			markdownContent += `- **Average runtime:** ${formatMs(avgMs)}\n`;
			markdownContent += `- **Total queries:** ${stats.totalQueries}\n\n`;

			markdownContent += `| Rank | Metric | Runtime | Queries |\n|------|--------|---------|---------|\n`;

			sorted.slice(0, 3).forEach((m, i) => {
				markdownContent += `| ${i + 1} | \`${m.metric}\` | ${m.runtime} | ${m.queryCount || ''} |\n`;
			});

			if (sorted.length > 3) {
				markdownContent += `| ... | ... | ... | ... |\n`;
				sorted.slice(-2).reverse().forEach((m, i) => {
					markdownContent += `| ${sorted.length - 1 + i} | \`${m.metric}\` | ${m.runtime} | ${m.queryCount || ''} |\n`;
				});
			}

			markdownContent += `\n---\n\n`;
		}
	}

	//
	// Approach summary

	if (approaches.size > 0) {
		markdownContent += `## 📈 By Approach\n\n`;
		markdownContent += `| Approach | Count | Total Time | Avg Time |\n|----------|-------|------------|----------|\n`;

		for (const [, approach] of approaches.entries()) {
			markdownContent += `| ${approach.description} | ${approach.count} | ${formatMs(approach.totalTime)} | ${formatMs(Math.round(approach.totalTime / approach.count))} |\n`;
		}

		markdownContent += `\n---\n\n`;
	}

	//
	// Fastest and slowest metrics

	const sorted: MetricLogEntryWithRuntime[] = metricsEntries
		.map(m => ({ ...m, runtimeMs: parseRuntimeToMs(m.runtime) }))
		.sort((a, b) => b.runtimeMs - a.runtimeMs);

	markdownContent += `## 🐌 Slowest Metrics\n\n`;
	markdownContent += `| Rank | Metric | Runtime |\n|------|--------|---------|\n`;

	sorted.slice(0, 5).forEach((m, i) => {
		markdownContent += `| ${i + 1} | \`${m.metric}\` | ${m.runtime} |\n`;
	});

	markdownContent += `\n## ⚡ Fastest Metrics\n\n`;
	markdownContent += `| Rank | Metric | Runtime |\n|------|--------|---------|\n`;

	sorted.slice(-5).reverse().forEach((m, i) => {
		markdownContent += `| ${i + 1} | \`${m.metric}\` | ${m.runtime} |\n`;
	});

	markdownContent += `\n---\n**Analysis completed:** ${new Date().toISOString()}\n`;

	//
	// Write the summary file

	writeFileSync(outputFile, markdownContent, 'utf8');

	return outputFile;
}
