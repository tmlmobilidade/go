/* * */

import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { type Stop, StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { type Location } from '@tmlmobilidade/go-types-locations';
import { parse } from 'csv-parse/sync';

/* * */

export interface GtfsStopRow {
	stop_desc?: string
	stop_id: string
	stop_lat: string
	stop_lon: string
	stop_name: string
}

/* * */

/**
 * Parses GTFS boarding stops and platforms (location_type 0 or empty).
 * @param text The contents of a standard GTFS stops.txt file
 * @returns The validated boarding stop rows
 */
export function parseStops(text: string): GtfsStopRow[] {
	//

	//
	// Parse the CSV and validate the required headers

	const required = ['stop_id', 'stop_name', 'stop_lat', 'stop_lon'];
	const rows: Record<string, string>[] = parse(text, {
		bom: true,
		columns: (headers: string[]) => {
			if (new Set(headers).size !== headers.length || required.some(header => !headers.includes(header))) {
				throw new Error(`Expected unique CSV headers including: ${required.join(', ')}`);
			}
			return headers;
		},
		skip_empty_lines: true,
		trim: true,
	});

	if (!rows.length) throw new Error('stops.txt contains no records');

	//
	// Validate stop IDs and select boarding stops

	const ids = new Set<string>();
	const stops: GtfsStopRow[] = [];

	for (const [index, row] of rows.entries()) {
		if (!row.stop_id || ids.has(row.stop_id)) throw new Error(`Record ${index + 1}: missing or duplicate stop_id`);
		ids.add(row.stop_id);

		if (!['', '0', '1', '2', '3', '4'].includes(row.location_type ?? '')) throw new Error(`Stop ${row.stop_id}: invalid location_type`);
		if (row.location_type && row.location_type !== '0') continue;

		for (const key of required) {
			if (!row[key]) throw new Error(`Stop ${row.stop_id}: missing ${key}`);
		}

		stops.push({
			stop_desc: row.stop_desc,
			stop_id: row.stop_id,
			stop_lat: row.stop_lat,
			stop_lon: row.stop_lon,
			stop_name: row.stop_name,
		});
	}

	return stops;
}

/* * */

/**
 * Maps a GTFS row to a validated GO stop.
 * @param row The GTFS boarding stop
 * @param id The assigned six-digit GO stop ID
 * @param location The resolved administrative location
 * @param agencyId The agency associated with the stop flag and legacy ID namespace
 * @returns The stop document ready for insertion
 */
export function toStop(row: GtfsStopRow, id: string, location: Location, agencyId: string): Stop {
	//

	//
	// Prepare audit fields and the abbreviated stop name

	const now = Date.now();

	const name = row.stop_name.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
	const shortName = getStopShortName(name);
	const ttsName = getStopTtsName(name);

	//
	// Map the GTFS fields and validate the stop document

	return StopSchema.parse({
		_id: id,
		created_at: now,
		created_by: 'system',
		flags: [{ agency_ids: [agencyId], is_harmonized: false, short_name: shortName, stop_id: row.stop_id }],
		latitude: Number(row.stop_lat),
		legacy_id: `${agencyId}:${row.stop_id}`,
		legacy_ids: [`${agencyId}:${row.stop_id}`],
		location,
		longitude: Number(row.stop_lon),
		name,
		observations: row.stop_desc || null,
		short_name: shortName,
		tts_name: ttsName,
		updated_at: now,
		updated_by: 'system',
	});
}
