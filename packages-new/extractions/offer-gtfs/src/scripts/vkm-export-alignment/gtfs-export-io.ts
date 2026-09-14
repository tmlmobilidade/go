/**
 * Shared GTFS export readers for vkm-export-alignment scripts.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface GtfsTripEntry {
	distanceKm: number
	isOff: boolean
	patternCode: string
	ruleToken: string
	serviceId: string
	timepoint: string
	tripId: string
}

export interface GtfsExportIndex {
	endOp: string
	serviceDates: Map<string, Set<string>>
	startOp: string
	tripsByPattern: Map<string, GtfsTripEntry[]>
}

export function parseCsv(path: string): Array<Record<string, string>> {
	const text = readFileSync(path, 'utf8').trim();
	const lines = text.split('\n');
	const header = lines[0]?.split(',') ?? [];

	return lines.slice(1).filter(Boolean).map((line) => {
		const cols = line.split(',');
		const row: Record<string, string> = {};

		for (const [i, key] of header.entries()) {
			row[key] = cols[i] ?? '';
		}

		return row;
	});
}

/** trip_id segment `2035` or `203500` → `20:35` */
export function parseTripTimepoint(raw: string): string {
	if (!raw) return '';
	if (raw.includes(':')) return raw;

	const digits = raw.replace(/\D/g, '');
	if (digits.length >= 4) {
		return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
	}

	return raw;
}

export function loadGtfsExportIndex(gtfsDir: string, startOp: string, endOp: string): GtfsExportIndex {
	const tripRows = parseCsv(resolve(gtfsDir, 'trips.txt'));
	const calRows = parseCsv(resolve(gtfsDir, 'calendar_dates.txt'));
	const shapeRows = parseCsv(resolve(gtfsDir, 'shapes.txt'));

	const shapeKm = new Map<string, number>();
	for (const row of shapeRows) {
		const id = row.shape_id;
		const dist = Number(row.shape_dist_traveled || 0);
		shapeKm.set(id, Math.max(shapeKm.get(id) ?? 0, dist));
	}

	const serviceDates = new Map<string, Set<string>>();
	for (const row of calRows) {
		const date = row.date.trim();
		if (date < startOp || date > endOp) continue;

		const sid = row.service_id;
		if (!serviceDates.has(sid)) serviceDates.set(sid, new Set());
		serviceDates.get(sid)?.add(date);
	}

	const tripsByPattern = new Map<string, GtfsTripEntry[]>();

	for (const row of tripRows) {
		const serviceId = row.service_id;
		if (!serviceDates.get(serviceId)?.size) continue;

		const tripId = row.trip_id;
		const parts = tripId.split('|');
		const patternCode = row.pattern_id || parts[0] || '';

		const entry: GtfsTripEntry = {
			distanceKm: shapeKm.get(row.shape_id) ?? 0,
			isOff: tripId.includes('-OFF-'),
			patternCode,
			ruleToken: parts[1] ?? '',
			serviceId,
			timepoint: parseTripTimepoint(parts[2] ?? ''),
			tripId,
		};

		if (!tripsByPattern.has(patternCode)) tripsByPattern.set(patternCode, []);
		tripsByPattern.get(patternCode)?.push(entry);
	}

	return {
		endOp,
		serviceDates,
		startOp,
		tripsByPattern,
	};
}

/** date → operating timepoints active in GTFS (all trips, deduped by date × timepoint). */
export function buildGtfsOperatingSlots(
	trips: GtfsTripEntry[],
	serviceDates: Map<string, Set<string>>,
): Map<string, Set<string>> {
	const byDate = new Map<string, Set<string>>();

	for (const trip of trips) {
		const dates = serviceDates.get(trip.serviceId);
		if (!dates) continue;

		for (const date of dates) {
			if (!byDate.has(date)) byDate.set(date, new Set());
			byDate.get(date)?.add(trip.timepoint);
		}
	}

	return byDate;
}

export function buildGtfsOffSlots(
	trips: GtfsTripEntry[],
	serviceDates: Map<string, Set<string>>,
): Map<string, Set<string>> {
	const byDate = new Map<string, Set<string>>();

	for (const trip of trips) {
		if (!trip.isOff) continue;

		const dates = serviceDates.get(trip.serviceId);
		if (!dates) continue;

		for (const date of dates) {
			if (!byDate.has(date)) byDate.set(date, new Set());
			byDate.get(date)?.add(trip.timepoint);
		}
	}

	return byDate;
}
