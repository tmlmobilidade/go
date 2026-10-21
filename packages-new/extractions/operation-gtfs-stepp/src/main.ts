/* * */

import { GtfsStrictV30SteppAgencySchema, GtfsStrictV30SteppRoutesSchema, GtfsStrictV30SteppRouteSteppSchema, GtfsStrictV30SteppShapesSchema, GtfsStrictV30SteppStopsSchema, GtfsStrictV30SteppStopTimesSchema, GtfsStrictV30SteppTripsSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import fs from 'node:fs';
import path from 'node:path';

import { buildCalendarRows, readServiceDates } from './calendar.js';
import { type OutputRow, type SteppWriters } from './writers.js';

/* * */

type Row = Record<string, string | undefined>;

interface Trip {
	first?: { sequence: number, stopId: string }
	last?: { sequence: number, stopId: string }
	row: Row
}

export interface PlanExportConfig {
	agencyCode: string
	endDate: string
	namespaceIds: boolean
	planId: string
	sharedRows: Map<string, string>
	sourceDirectory: string
	startDate: string
	writers: SteppWriters
}

const CONTRACTS: Record<string, string> = { 41: 'TML 24/2020', 42: 'TML 25/2020', 43: 'TML 26/2020', 44: 'TML 27/2020' };

/* * */

function required(row: Row, field: string): string {
	if (!row[field]) throw new Error(`Missing ${field} in ${JSON.stringify(row)}`);
	return row[field];
}

function number(value: string | undefined): number | undefined {
	return value === undefined || value === '' ? undefined : Number(value);
}

function pick(row: Row, fields: string[]): Row {
	return Object.fromEntries(fields.map(field => [field, row[field] ?? '']));
}

function referenced<T>(rows: Map<string, T>, id: string, table: string): T {
	const row = rows.get(id);
	if (row === undefined) throw new Error(`Missing ${table} "${id}"`);
	return row;
}

async function readCsv(directory: string, name: string, callback: (row: Row) => Promise<void>, optional = false) {
	const filePath = path.join(directory, `${name}.txt`);
	if (optional && !fs.existsSync(filePath)) return;
	try {
		await streamCsvFile<Row>(filePath, callback);
	} catch (error) {
		throw new Error(`Could not export ${name}.txt: ${error instanceof Error ? error.message : error}`, { cause: error });
	}
}

async function readById(directory: string, name: string, field: string): Promise<Map<string, Row>> {
	const rows = new Map<string, Row>();
	await readCsv(directory, name, async (row) => {
		const id = required(row, field);
		if (rows.has(id)) throw new Error(`Duplicate ${field} "${id}"`);
		rows.set(id, row);
	});
	return rows;
}

/** Keeps shared public IDs stable and rejects incompatible definitions across plans. */
async function writeShared(config: PlanExportConfig, table: 'agency' | 'routes' | 'stops', id: string, row: OutputRow) {
	const key = `${table}:${id}`;
	const signature = JSON.stringify(row);
	const previous = config.sharedRows.get(key);
	if (previous !== undefined && previous !== signature) {
		throw new Error(`Selected plans have conflicting ${table} data for "${id}" (plan ${config.planId}). Export these plans separately or align their source data.`);
	}
	if (previous !== undefined) return;
	config.sharedRows.set(key, signature);
	await config.writers[table].write(row);
}

/* * */

/** Converts one normalized Operation plan into the shared STePP feed. */
export async function exportPlanGtfs(config: PlanExportConfig): Promise<number> {
	const { sourceDirectory, writers } = config;
	const services = await readServiceDates(sourceDirectory, config.startDate, config.endDate);
	const routes = await readById(sourceDirectory, 'routes', 'route_id');
	const trips = new Map<string, Trip>();
	const usedRoutes = new Set<string>();
	const usedServices = new Set<string>();
	const usedShapes = new Set<string>();
	const usedStops = new Set<string>();

	// Only internal identifiers need a plan namespace. Stops and routes keep their public IDs.
	const scopedId = (id: string) => config.namespaceIds ? `plan_${encodeURIComponent(config.planId)}:${encodeURIComponent(id)}` : id;

	await readCsv(sourceDirectory, 'trips', async (row) => {
		if (!services.get(required(row, 'service_id'))?.size) return;
		const id = required(row, 'trip_id');
		if (trips.has(id)) throw new Error(`Duplicate trip_id "${id}"`);
		const routeId = required(row, 'route_id');
		const route = routes.get(routeId);
		if (!route) throw new Error(`Trip "${id}" references missing route "${routeId}"`);
		if (route.agency_id !== config.agencyCode) throw new Error(`Route "${routeId}" does not belong to agency "${config.agencyCode}"`);
		trips.set(id, { row });
		usedRoutes.add(routeId);
		usedServices.add(required(row, 'service_id'));
		usedShapes.add(required(row, 'shape_id'));
	});

	if (trips.size === 0) return 0;

	const agencies = await readById(sourceDirectory, 'agency', 'agency_id');
	const sourceAgency = agencies.get(config.agencyCode);
	if (!sourceAgency) throw new Error(`Plan "${config.planId}" has no agency "${config.agencyCode}" in agency.txt`);
	const agency = pick(sourceAgency, ['agency_id', 'agency_name', 'agency_url', 'agency_timezone', 'agency_lang', 'agency_phone', 'agency_fare_url', 'agency_email']);
	agency.agency_timezone ||= 'Europe/Lisbon';
	agency.agency_lang ||= 'pt';
	GtfsStrictV30SteppAgencySchema.parse({ ...agency, agency_url: agency.agency_url || undefined });
	await writeShared(config, 'agency', config.agencyCode, agency);

	// Stream the large tables; retain only the endpoint references needed by routes_stepp.
	await readCsv(sourceDirectory, 'stop_times', async (row) => {
		const trip = trips.get(required(row, 'trip_id'));
		if (!trip) return;
		GtfsStrictV30SteppStopTimesSchema.parse({
			...row,
			continuous_drop_off: number(row.continuous_drop_off),
			continuous_pickup: number(row.continuous_pickup),
			shape_dist_traveled: number(row.shape_dist_traveled),
			stop_sequence: number(row.stop_sequence),
		});
		const stopId = required(row, 'stop_id');
		const sequence = Number(row.stop_sequence);
		if (!trip.first || sequence < trip.first.sequence) trip.first = { sequence, stopId };
		if (!trip.last || sequence > trip.last.sequence) trip.last = { sequence, stopId };
		usedStops.add(stopId);
		await writers.stop_times.write({ ...row, trip_id: scopedId(required(row, 'trip_id')) });
	});

	const stops = new Map<string, Row>();
	await readCsv(sourceDirectory, 'stops', async (row) => {
		const id = required(row, 'stop_id');
		if (!usedStops.has(id)) return;
		if (stops.has(id)) throw new Error(`Duplicate stop_id "${id}"`);
		const stop = pick(row, ['stop_id', 'stop_code', 'stop_name', 'stop_desc', 'stop_lat', 'stop_lon', 'zone_id']);
		GtfsStrictV30SteppStopsSchema.parse({ ...stop, stop_lat: number(stop.stop_lat), stop_lon: number(stop.stop_lon) });
		stops.set(id, stop);
		await writeShared(config, 'stops', id, stop);
	});
	for (const id of usedStops) if (!stops.has(id)) throw new Error(`Missing stop "${id}" referenced by stop_times.txt`);

	const foundShapes = new Set<string>();
	await readCsv(sourceDirectory, 'shapes', async (row) => {
		const id = required(row, 'shape_id');
		if (!usedShapes.has(id)) return;
		GtfsStrictV30SteppShapesSchema.parse({
			...row,
			shape_dist_traveled: number(row.shape_dist_traveled),
			shape_pt_lat: number(row.shape_pt_lat),
			shape_pt_lon: number(row.shape_pt_lon),
			shape_pt_sequence: number(row.shape_pt_sequence),
		});
		foundShapes.add(id);
		await writers.shapes.write({ ...row, shape_id: scopedId(id) });
	});
	for (const id of usedShapes) if (!foundShapes.has(id)) throw new Error(`Missing shape "${id}" referenced by trips.txt`);

	const patterns = new Map<string, { circular: boolean, firstStop: string, lastStop: string, routeId: string }>();
	const directionReferences = new Map<string, Row>();
	for (const [id, trip] of trips) {
		if (!trip.first || !trip.last) throw new Error(`Trip "${id}" has no stop times`);
		const row = trip.row;
		const routeId = required(row, 'route_id');
		const reference = directionReferences.get(routeId);
		if (!reference) directionReferences.set(routeId, row);
		const derivedDirection = reference && row.trip_headsign !== reference.trip_headsign && row.shape_id !== reference.shape_id ? '1' : '0';
		const output = {
			...row,
			bikes_allowed: row.bikes_allowed ?? '0',
			block_id: row.block_id ? scopedId(row.block_id) : undefined,
			direction_id: row.direction_id ?? derivedDirection,
			service_id: scopedId(required(row, 'service_id')),
			shape_id: scopedId(required(row, 'shape_id')),
			trip_id: scopedId(id),
			wheelchair_accessible: row.wheelchair_accessible ?? '0',
		};
		GtfsStrictV30SteppTripsSchema.parse(output);
		await writers.trips.write(output);
		const key = JSON.stringify([routeId, row.shape_id, row.trip_headsign]);
		const circular = trip.first.stopId === trip.last.stopId;
		const previous = patterns.get(key);
		patterns.set(key, {
			circular: circular && (previous?.circular ?? true),
			firstStop: previous?.firstStop ?? trip.first.stopId,
			lastStop: previous?.lastStop ?? trip.last.stopId,
			routeId,
		});
	}

	for (const id of usedRoutes) {
		const route = pick(referenced(routes, id, 'route'), ['route_id', 'agency_id', 'route_short_name', 'route_long_name', 'route_desc', 'route_type']);
		GtfsStrictV30SteppRoutesSchema.parse(route);
		await writeShared(config, 'routes', id, route);
	}

	const routeExtensions = new Map<string, Row[]>();
	await readCsv(sourceDirectory, 'routes_stepp', async (row) => {
		const id = required(row, 'route_id');
		routeExtensions.set(id, [...(routeExtensions.get(id) ?? []), row]);
	}, true);

	for (const routeId of usedRoutes) {
		const route = referenced(routes, routeId, 'route');
		const routePatterns = Array.from(patterns.values()).filter(pattern => pattern.routeId === routeId);
		const extensions = routeExtensions.get(routeId);
		// Source extension rows describe a route and have no reliable pattern key.
		// Preserve each once instead of pairing it with every active pattern.
		const records = extensions
			? extensions.map(extension => ({ extension, pattern: { ...routePatterns[0], circular: routePatterns.every(pattern => pattern.circular) } }))
			: routePatterns.map(pattern => ({ extension: route, pattern }));
		for (const { extension, pattern } of records) {
			const output = {
				circular: extensions && extension.circular !== undefined ? extension.circular : pattern.circular ? '1' : '0',
				contract: extension.contract ?? route.contract ?? CONTRACTS[config.agencyCode] ?? '',
				path_type: extension.path_type ?? route.path_type ?? '1',
				route_destination: extension.route_destination ?? route.route_destination ?? referenced(stops, pattern.lastStop, 'stop').stop_name,
				route_id: pattern.routeId,
				route_origin: extension.route_origin ?? route.route_origin ?? referenced(stops, pattern.firstStop, 'stop').stop_name,
			};
			GtfsStrictV30SteppRouteSteppSchema.parse(output);
			// Multiple directions may share a route ID, as in the Offer STePP format.
			const key = `routes_stepp:${JSON.stringify(output)}`;
			if (config.sharedRows.has(key)) continue;
			config.sharedRows.set(key, key);
			await writers.routes_stepp.write(output);
		}
	}

	for (const id of usedServices) {
		const { calendar, calendarDates } = buildCalendarRows(scopedId(id), referenced(services, id, 'service'));
		await writers.calendar.write(calendar);
		for (const row of calendarDates) await writers.calendar_dates.write(row);
	}
	return trips.size;
}
