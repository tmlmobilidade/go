import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Script to calculate total runtime from performance metrics JSON file
 * Usage: node calculate-total-runtime.js [path-to-metrics-file]
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to parse runtime string and convert to milliseconds
function parseRuntimeToMs(runtimeStr) {
	let totalMs = 0;

	// Extract minutes (e.g., "9m" -> 9 minutes)
	const minMatch = runtimeStr.match(/(\d+)m(?!\w)/);
	if (minMatch) {
		totalMs += parseInt(minMatch[1]) * 60 * 1000;
	}

	// Extract seconds (e.g., "14s" -> 14 seconds)
	// Use negative lookahead to avoid matching "ms"
	const secMatch = runtimeStr.match(/(\d+)s(?![\w])/);
	if (secMatch) {
		totalMs += parseInt(secMatch[1]) * 1000;
	}

	// Extract milliseconds (e.g., "936ms" -> 936 milliseconds)
	const msMatch = runtimeStr.match(/(\d+)ms/);
	if (msMatch) {
		totalMs += parseInt(msMatch[1]);
	}

	return totalMs;
}

// Function to format milliseconds back to readable format
function formatMs(ms) {
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

// Get metrics file path from command line argument or use default
const metricsFilePath = process.argv[2] || join(__dirname, 'metrics-performance.json');

// Check if file exists
if (!existsSync(metricsFilePath)) {
	console.error(`Error: Metrics file not found at ${metricsFilePath}`);
	console.error('Usage: node calculate-total-runtime.js [path-to-metrics-file]');
	process.exit(1);
}

// Read the metrics file
let metricsData;
try {
	metricsData = JSON.parse(readFileSync(metricsFilePath, 'utf8'));
}
catch (error) {
	console.error(`Error reading metrics file: ${error.message}`);
	process.exit(1);
}

if (!Array.isArray(metricsData)) {
	console.error('Error: Metrics file should contain an array of metrics');
	process.exit(1);
}

console.log(`📊 Performance Metrics Analysis`);
console.log(`📁 File: ${metricsFilePath}`);
console.log(`📈 Total metrics: ${metricsData.length}`);
console.log('');

// Calculate total runtime
let totalMs = 0;
let totalQueries = 0;
const approaches = new Map();

metricsData.forEach((metric) => {
	const runtimeMs = parseRuntimeToMs(metric.runtime);
	totalMs += runtimeMs;
	totalQueries += metric.queryCount || 0;

	// Track approaches
	if (metric.approach && metric.approach.key) {
		const key = metric.approach.key;
		if (!approaches.has(key)) {
			approaches.set(key, { count: 0, description: metric.approach.description, totalTime: 0 });
		}
		const approach = approaches.get(key);
		approach.count++;
		approach.totalTime += runtimeMs;
	}
});

console.log('');

console.log('📊 SUMMARY');
console.log('===================');
console.log(`🕒 TOTAL RUNTIME: ${formatMs(totalMs)}`);
console.log(`📏 Total in milliseconds: ${totalMs.toLocaleString()}ms`);
console.log(`📏 Total in seconds: ${(totalMs / 1000).toFixed(1)}s`);
console.log(`📏 Total in minutes: ${(totalMs / (60 * 1000)).toFixed(1)} minutes`);
console.log(`📏 Total in hours: ${(totalMs / (60 * 60 * 1000)).toFixed(2)} hours`);
console.log(`🔍 Total queries executed: ${totalQueries.toLocaleString()}`);

if (approaches.size > 0) {
	console.log('');
	console.log('📈 BY APPROACH:');
	console.log('===============');
	for (const [, data] of approaches) {
		console.log(`${data.description}:`);
		console.log(`  Count: ${data.count} metrics`);
		console.log(`  Total time: ${formatMs(data.totalTime)}`);
		console.log(`  Avg time: ${formatMs(Math.round(data.totalTime / data.count))}`);
		console.log('');
	}
}

// Find slowest and fastest
const sorted = metricsData
	.map(metric => ({ ...metric, runtimeMs: parseRuntimeToMs(metric.runtime) }))
	.sort((a, b) => b.runtimeMs - a.runtimeMs);

console.log('🐌 SLOWEST METRICS:');
console.log('==================');
sorted.slice(0, 5).forEach((metric, index) => {
	console.log(`${index + 1}. ${metric.metric}: ${metric.runtime}`);
});

console.log('');
console.log('⚡ FASTEST METRICS:');
console.log('==================');
sorted.slice(-5).reverse().forEach((metric, index) => {
	console.log(`${index + 1}. ${metric.metric}: ${metric.runtime}`);
});
