/* * */

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

export function normalizeGtfsTimeToHHMM(time?: string) {
	if (!time) return null;
	const [rawHours, rawMinutes] = time.split(':');
	if (!rawHours || !rawMinutes) return null;
	let hours = Number(rawHours);
	const minutes = Number(rawMinutes);
	if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
	if (hours >= 24) hours = hours % 24;
	if (minutes < 0 || minutes > 59) return null;
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
