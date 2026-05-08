/* * */

import fs from 'node:fs';

/* * */

/**
 * Rewrites the service_id column in a CSV/TXT file using the provided mapping.
 * Reads the file, replaces every service_id value in-place, and writes it back.
 * @param filePath - Absolute path to the CSV/TXT file
 * @param mapping - Map from old text service ID to new numeric string
 */
export function rewriteServiceIds(filePath: string, mapping: Map<string, string>): void {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');

	if (lines.length === 0) return;

	const header = lines[0].split(',');
	const serviceIdIdx = header.indexOf('service_id');

	if (serviceIdIdx === -1) return;

	const rewritten = lines.map((line, i) => {
		if (i === 0) return line;
		if (line.trim() === '') return line;

		const cols = line.split(',');
		const original = cols[serviceIdIdx];

		if (original !== undefined && mapping.has(original)) {
			cols[serviceIdIdx] = mapping.get(original);
		}

		return cols.join(',');
	});

	fs.writeFileSync(filePath, rewritten.join('\n'), 'utf-8');
}

/**
 * Rewrites the trip_id column in a CSV/TXT file using the provided service ID mapping.
 * trip_id has the format PATTERN|TOKEN|HHMM — the TOKEN (middle segment) is replaced.
 * @param filePath - Absolute path to the CSV/TXT file
 * @param mapping - Map from old text service ID (ruleToken) to new numeric string
 */
export function rewriteTripIds(filePath: string, mapping: Map<string, string>): void {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');

	if (lines.length === 0) return;

	const header = lines[0].split(',');
	const tripIdIdx = header.indexOf('trip_id');

	if (tripIdIdx === -1) return;

	const rewritten = lines.map((line, i) => {
		if (i === 0) return line;
		if (line.trim() === '') return line;

		const cols = line.split(',');
		const tripId = cols[tripIdIdx];

		if (tripId !== undefined) {
			const parts = tripId.split('|');
			// Format: PATTERN|TOKEN|HHMM — replace index 1
			if (parts.length === 3 && mapping.has(parts[1])) {
				parts[1] = mapping.get(parts[1]);
				cols[tripIdIdx] = parts.join('|');
			}
		}

		return cols.join(',');
	});

	fs.writeFileSync(filePath, rewritten.join('\n'), 'utf-8');
}
