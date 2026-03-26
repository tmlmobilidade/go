/* * */

import { normalizeOperationalHhmmInput } from '@tmlmobilidade/types';
import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import Papa from 'papaparse';
import path from 'path';

export function truncate(value: string, maxLength: number) {
	if (value.length <= maxLength) return value;
	return value.slice(0, maxLength);
}

export async function readJsonFile<T>(filePath: string) {
	const content = await fs.readFile(filePath, 'utf8');
	return JSON.parse(content) as T;
}

export async function readGtfsFile(gtfsPath: string, fileName: string) {
	if (gtfsPath.endsWith('.zip')) {
		const zip = new AdmZip(gtfsPath);
		const entry = zip.getEntry(fileName);
		if (!entry) throw new Error(`Missing ${fileName} in GTFS zip.`);
		return entry.getData().toString('utf8');
	}

	const filePath = path.join(gtfsPath, fileName);
	return fs.readFile(filePath, 'utf8');
}

export function parseCsv<T>(content: string) {
	const parsed = Papa.parse<T>(content, {
		dynamicTyping: false,
		header: true,
		skipEmptyLines: true,
	});

	if (parsed.errors?.length) {
		const [first] = parsed.errors;
		throw new Error(`CSV parse error: ${first.message}`);
	}

	return parsed.data;
}

export const toNumberOrNull = (value: unknown) => {
	if (value === null || value === undefined || value === '') return null;
	const num = Number(value);
	return Number.isNaN(num) ? value : num;
};

export function buildPatternCode(lineCode: string, directionId: string, index: number) {
	return truncate(`${lineCode}_${directionId}_${index}`, 10);
}

export function resolvePatternKey(directionId: string, patternId: null | string, fingerprint: string) {
	return patternId ? `pid:${directionId}:${patternId}` : `fp:${directionId}:${fingerprint}`;
}

export function resolvePatternCode(lineCode: string, directionId: string, patternId: null | string, index: number) {
	if (patternId) return truncate(patternId, 10);
	return buildPatternCode(lineCode, directionId, index);
}

function stripSeconds(time: string | undefined): string | undefined {
	if (!time) return time;
	return time.split(':').slice(0, 2).join(':');
}

const loggedTimepointWarnings = new Set<string>();

export function normalizeGtfsTimeToHHMM(time?: string, patternId?: string): null | string {
	if (!time) return null;
	const timeWithoutSeconds = stripSeconds(time);
	const normalized = normalizeOperationalHhmmInput(timeWithoutSeconds);
	if (!normalized) return null;

	let hours = normalized.split(':').map(Number)[0];
	const minutes = normalized.split(':').map(Number)[1];

	// If hours > 27, wrap around and log a warning only once per patternId+timepoint
	if (hours > 27) {
		const original = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		const newHours = hours - 24;
		const fixed = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		const logKey = `${patternId || 'unknown'}|${original}`;
		if (!loggedTimepointWarnings.has(logKey)) {
			console.warn(`[gtfs-importer] Time out of operational range in pattern ${patternId || 'unknown'}: ${original} → ${fixed}`);
			loggedTimepointWarnings.add(logKey);
		}
		hours = newHours;
	}

	// If hours < 4, wrap to operational day (shouldn't happen, but just in case)
	if (hours < 4) {
		const original = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		const newHours = hours + 24;
		const fixed = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		const logKey = `${patternId || 'unknown'}|${original}`;
		if (!loggedTimepointWarnings.has(logKey)) {
			console.warn(`[gtfs-importer] Time below operational range in pattern ${patternId || 'unknown'}: ${original} → ${fixed}`);
			loggedTimepointWarnings.add(logKey);
		}
		hours = newHours;
	}

	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function normalizeGtfsDistance(value?: null | number | string) {
	if (value === null || value === undefined) return null;
	const num = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
	if (!Number.isFinite(num)) return null;
	return num;
}

export function normalizeGtfsTimeToSeconds(time?: string) {
	if (!time) return null;
	const [rawHours, rawMinutes, rawSeconds] = time.split(':');
	if (!rawHours || !rawMinutes) return null;
	const hours = Number(rawHours);
	const minutes = Number(rawMinutes);
	const seconds = rawSeconds ? Number(rawSeconds) : 0;
	if ([hours, minutes, seconds].some(value => Number.isNaN(value))) return null;
	if (minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return null;
	return (hours * 3600) + (minutes * 60) + seconds;
}
