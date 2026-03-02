/* * */

import { type GTFS_StopTime, type GTFS_StopTime_Raw, type GTFS_Trip, type GTFS_Trip_Raw, GtfsTMLRoute, GtfsTMLRouteSchema, Typology, validateGtfsStopTime, validateGtfsTrip } from '@tmlmobilidade/types';
import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import Papa from 'papaparse';
import path from 'path';

/* * */

export function normalizeHexColor(value?: null | string) {
	if (!value) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
	return normalized.toUpperCase();
}

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

export async function loadGtfsRoutes(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'routes.txt');
	const rawRoutes = parseCsv<GtfsTMLRoute>(content);
	const routes: GtfsTMLRoute[] = [];
	const toNumberOrNull = (value: unknown) => {
		if (value === null || value === undefined || value === '') return null;
		const num = Number(value);
		return Number.isNaN(num) ? value : num;
	};

	for (const raw of rawRoutes) {
		try {
			const normalized = {
				...raw,
				circular: toNumberOrNull(raw.circular),
				line_id: toNumberOrNull(raw.line_id),
				line_type: toNumberOrNull(raw.line_type),
				path_type: toNumberOrNull(raw.path_type),
				route_type: toNumberOrNull(raw.route_type),
				school: toNumberOrNull(raw.school),
			} as GtfsTMLRoute;
			routes.push(GtfsTMLRouteSchema.parse(normalized));
		} catch (error) {
			console.warn(`Skipping route due to validation error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return routes;
}

export async function loadGtfsTrips(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'trips.txt');
	const rawTrips = parseCsv<GTFS_Trip_Raw>(content);
	const trips: GTFS_Trip[] = [];

	for (const raw of rawTrips) {
		try {
			trips.push(validateGtfsTrip(raw));
		} catch (error) {
			console.warn(`Skipping trip due to validation error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return trips;
}

export async function loadGtfsTripsWithPattern(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'trips.txt');
	const rawTrips = parseCsv<GTFS_Trip_Raw>(content);
	const trips: Array<GTFS_Trip & { pattern_id?: string }> = [];

	for (const raw of rawTrips) {
		try {
			const validated = validateGtfsTrip(raw);
			trips.push({ ...validated, pattern_id: raw.pattern_id });
		} catch (error) {
			console.warn(`Skipping trip due to validation error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return trips;
}

export async function loadGtfsStopTimes(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'stop_times.txt');
	const rawStopTimes = parseCsv<GTFS_StopTime_Raw>(content);
	const stopTimes: GTFS_StopTime[] = [];

	for (const raw of rawStopTimes) {
		try {
			stopTimes.push(validateGtfsStopTime(raw));
		} catch (error) {
			console.warn(`Skipping stop_time due to validation error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return stopTimes;
}

export interface AfectacaoRow {
	accepted_zone_codes?: string
	interchange?: number | string
	line_id?: number | string
	pattern_id?: string
	stop_id?: string
}

export async function loadAfectacao(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'afetacao.csv');
	return parseCsv<AfectacaoRow>(content);
}

export function buildTypologyColorMap(typologies: Typology[]) {
	const map = new Map<string, Typology>();
	for (const typology of typologies) {
		const color = normalizeHexColor(typology.color);
		if (!color) continue;
		if (!map.has(color)) map.set(color, typology);
	}
	return map;
}
