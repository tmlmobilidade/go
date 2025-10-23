import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, 'metrics-performance.json');

interface LogEntry {
	approach: { description: string, key: string }
	metric: string
	queryCount: number
	runtime: string
	timestamp: string
}

export function logMetricToFile(log: LogEntry) {
	//

	//
	// Read existing logs
	let logs: LogEntry[] = [];
	if (fs.existsSync(logFilePath)) {
		const content = fs.readFileSync(logFilePath, 'utf-8');
		logs = content ? JSON.parse(content) : [];
	}

	//
	// Remove any previous entry with same metric + approach.key
	logs = logs.filter(
		entry =>
			!(entry.metric === log.metric && entry.approach.key === log.approach.key),
	);

	//
	// Add new log
	logs.push(log);

	//
	// Write back to file
	fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
}
