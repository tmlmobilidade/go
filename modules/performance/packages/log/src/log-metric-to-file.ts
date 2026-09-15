/* * */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/* * */

export interface MetricLogEntry {
	approach: { description: string, key: string }
	metric: string
	queryCount: number
	runtime: string
	timestamp: string
}

/* * */

export const METRICS_ANALYSIS_FOLDER = 'analysis';
export const METRICS_LOG_FILE = 'metrics-performance.json';

/**
 * Appends a metric run entry to the `analysis/metrics-performance.json` file
 * of the current working directory, replacing any previous entry
 * with the same metric and approach key.
 * @param log The metric run entry to store
 */
export function logMetricToFile(log: MetricLogEntry) {
	//

	//
	// Ensure the analysis folder exists

	const analysisFolder = join(process.cwd(), METRICS_ANALYSIS_FOLDER);

	if (!existsSync(analysisFolder)) {
		mkdirSync(analysisFolder, { recursive: true });
	}

	//
	// Load the existing entries

	const logFilePath = join(analysisFolder, METRICS_LOG_FILE);

	let logs: MetricLogEntry[] = [];

	if (existsSync(logFilePath)) {
		try {
			const content = JSON.parse(readFileSync(logFilePath, 'utf-8')) as unknown;
			logs = Array.isArray(content) ? content as MetricLogEntry[] : [];
		} catch {
			logs = [];
		}
	}

	//
	// Replace the entry with the same metric and approach key

	logs = logs.filter(entry => !(entry.metric === log.metric && entry.approach.key === log.approach.key));

	logs.push(log);

	//
	// Write the entries back to the file

	let formatted = JSON.stringify(logs, null, '\t');
	if (!formatted.endsWith('\n')) {
		formatted += '\n';
	}

	writeFileSync(logFilePath, formatted, 'utf-8');
}
