/* * */

import fs from 'node:fs/promises';
import path from 'node:path';

/* * */

export type OutputRow = Record<string, number | string | undefined>;

// Explicit columns also produce valid headers when an optional table has no rows.
const COLUMNS = {
	agency: ['agency_id', 'agency_name', 'agency_url', 'agency_timezone', 'agency_lang', 'agency_phone', 'agency_fare_url', 'agency_email'],
	calendar: ['service_id', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'end_date', 'start_date'],
	calendar_dates: ['date', 'exception_type', 'service_id'],
	routes: ['route_id', 'agency_id', 'route_short_name', 'route_long_name', 'route_desc', 'route_type'],
	routes_stepp: ['route_id', 'route_origin', 'route_destination', 'circular', 'path_type', 'contract'],
	shapes: ['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'shape_pt_sequence', 'shape_dist_traveled'],
	stop_times: ['trip_id', 'arrival_time', 'departure_time', 'stop_id', 'stop_sequence', 'shape_dist_traveled', 'stop_headsign', 'pickup_type', 'drop_off_type', 'continuous_pickup', 'continuous_drop_off', 'timepoint'],
	stops: ['stop_id', 'stop_code', 'stop_name', 'stop_desc', 'stop_lat', 'stop_lon', 'zone_id'],
	trips: ['route_id', 'service_id', 'trip_id', 'trip_headsign', 'direction_id', 'shape_id', 'bikes_allowed', 'wheelchair_accessible', 'block_id', 'trip_short_name'],
} as const;

function escapeCell(value: number | string | undefined): string {
	const text = String(value ?? '');
	return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Buffers CSV rows without retaining a complete feed in memory. */
export class SteppCsvWriter {
	private buffer: string;

	constructor(private filePath: string, private columns: readonly string[]) {
		this.buffer = `${columns.join(',')}\n`;
	}

	async close() {
		if (!this.buffer) return;
		await fs.appendFile(this.filePath, this.buffer);
		this.buffer = '';
	}

	async write(row: OutputRow) {
		this.buffer += `${this.columns.map(column => escapeCell(row[column])).join(',')}\n`;
		if (this.buffer.length >= 64 * 1024) await this.close();
	}
}

export type SteppWriters = Record<keyof typeof COLUMNS, SteppCsvWriter>;

export async function createSteppWriters(outputDirectory: string): Promise<SteppWriters> {
	await fs.mkdir(outputDirectory, { recursive: true });
	const writers = {} as SteppWriters;
	for (const name of Object.keys(COLUMNS) as (keyof typeof COLUMNS)[]) {
		const filePath = path.join(outputDirectory, `${name}.txt`);
		await fs.writeFile(filePath, '');
		writers[name] = new SteppCsvWriter(filePath, COLUMNS[name]);
	}
	return writers;
}
