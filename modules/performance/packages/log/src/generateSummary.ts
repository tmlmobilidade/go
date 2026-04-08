import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';

// -----------------------------
// Helper Functions
// -----------------------------

function parseRuntimeToMs(runtimeStr: string) {
	let totalMs = 0;

	const minMatch = runtimeStr.match(/(\d+)m(?!\w)/);
	if (minMatch) totalMs += parseInt(minMatch[1]) * 60 * 1000;

	const secMatch = runtimeStr.match(/(\d+)s(?![\w])/);
	if (secMatch) totalMs += parseInt(secMatch[1]) * 1000;

	const msMatch = runtimeStr.match(/(\d+)ms/);
	if (msMatch) totalMs += parseInt(msMatch[1]);

	return totalMs;
}

function formatMs(ms: number) {
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

function extractMetricGroup(metricName: string) {
	const match = metricName.match(/^demand_by_(.+)_by_(day|month|year)$/);
	return match ? match[1] : null;
}

// -----------------------------
// Main Function
// -----------------------------

export function generatePerformanceSummary() {
	//

	const cwd = process.cwd(); // /performance/apps/sync-metrics-...

	const analysisDir = path.join(cwd, 'analysis');
	const metricsFile = path.join(analysisDir, 'metrics-performance.json');
	const outputFile = path.join(analysisDir, 'summary.md');

	// -----------------------------
	// Load JSON file
	// -----------------------------
	if (!existsSync(metricsFile)) {
		console.warn(`Metrics file does not exist: ${metricsFile}`);
		return;
	}

	let metricsData;
	try {
		metricsData = JSON.parse(readFileSync(metricsFile, 'utf8'));
	} catch (err) {
		console.error(`Error parsing metrics JSON: ${err.message}`);
		return;
	}

	if (!Array.isArray(metricsData)) {
		console.error(`Metrics file must contain an array`);
		return;
	}

	// -----------------------------
	// Prepare Markdown
	// -----------------------------

	let markdownContent = `# Performance Metrics Analysis

**Generated:** ${new Date().toISOString()}
**Source File:** \`${metricsFile}\`
**Total Metrics:** ${metricsData.length}

---

`;

	let totalMs = 0;
	let totalQueries = 0;

	const approaches = new Map();
	const groupStats = new Map();

	metricsData.forEach((metric) => {
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
			const a = approaches.get(key);
			a.count++;
			a.totalTime += runtimeMs;
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
			const g = groupStats.get(group);
			g.metrics.push({ ...metric, runtimeMs });
			g.totalMs += runtimeMs;
			g.totalQueries += metric.queryCount || 0;
		}
	});

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

	// -----------------------------
	// Group Analysis
	// -----------------------------
	if (groupStats.size > 0) {
		markdownContent += `## 🏷️ Metric Groups (sorted by total runtime)\n\n`;

		const sortedGroups = [...groupStats.entries()].sort(
			(a, b) => b[1].totalMs - a[1].totalMs,
		);

		for (const [group, stats] of sortedGroups) {
			const avgMs = stats.totalMs / stats.metrics.length;
			const sorted = [...stats.metrics].sort(
				(a, b) => b.runtimeMs - a.runtimeMs,
			);

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

	// -----------------------------
	// Approach Summary
	// -----------------------------
	if (approaches.size > 0) {
		markdownContent += `## 📈 By Approach\n\n`;
		markdownContent += `| Approach | Count | Total Time | Avg Time |\n|----------|-------|------------|----------|\n`;

		for (const [, a] of approaches.entries()) {
			markdownContent += `| ${a.description} | ${a.count} | ${formatMs(a.totalTime)} | ${formatMs(Math.round(a.totalTime / a.count))} |\n`;
		}

		markdownContent += `\n---\n\n`;
	}

	// -----------------------------
	// Fastest / Slowest
	// -----------------------------
	const sorted = metricsData
		.map(m => ({ ...m, runtimeMs: parseRuntimeToMs(m.runtime) }))
		.sort((a, b) => b.runtimeMs - a.runtimeMs);

	// Slowest
	markdownContent += `## 🐌 Slowest Metrics\n\n`;
	markdownContent += `| Rank | Metric | Runtime |\n|------|--------|---------|\n`;

	sorted.slice(0, 5).forEach((m, i) => {
		markdownContent += `| ${i + 1} | \`${m.metric}\` | ${m.runtime} |\n`;
	});

	// Fastest
	markdownContent += `\n## ⚡ Fastest Metrics\n\n`;
	markdownContent += `| Rank | Metric | Runtime |\n|------|--------|---------|\n`;

	sorted.slice(-5).reverse().forEach((m, i) => {
		markdownContent += `| ${i + 1} | \`${m.metric}\` | ${m.runtime} |\n`;
	});

	markdownContent += `\n---\n**Analysis completed:** ${new Date().toISOString()}\n`;

	// -----------------------------
	// Write file
	// -----------------------------
	const summaryFile = join(outputFile);
	writeFileSync(summaryFile, markdownContent, 'utf8');

	return summaryFile;
}
