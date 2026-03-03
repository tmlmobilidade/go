import fs from 'fs';
import path from 'path';

interface LogEntry {
	approach: { description: string, key: string }
	metric: string
	queryCount: number
	runtime: string
	timestamp: string
}

export function logMetricToFile(log: LogEntry) {
	const root = process.cwd();
	const analysisFolder = path.join(root, 'analysis');

	if (!fs.existsSync(analysisFolder)) {
		fs.mkdirSync(analysisFolder, { recursive: true });
	}

	const logFilePath = path.join(analysisFolder, 'metrics-performance.json');

	let logs: LogEntry[] = [];

	// Load existing
	if (fs.existsSync(logFilePath)) {
		try {
			const content = fs.readFileSync(logFilePath, 'utf-8');
			logs = Array.isArray(JSON.parse(content)) ? JSON.parse(content) : [];
		} catch {
			logs = [];
		}
	}

	// Replace same (metric + approach.key)
	logs = logs.filter(
		entry =>
			!(entry.metric === log.metric && entry.approach.key === log.approach.key),
	);

	logs.push(log);

	let formatted = JSON.stringify(logs, null, '\t');
	if (!formatted.endsWith('\n')) {
		formatted += '\n';
	}

	fs.writeFileSync(logFilePath, formatted, 'utf-8');
}
