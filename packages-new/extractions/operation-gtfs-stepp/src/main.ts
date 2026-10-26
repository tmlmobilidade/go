/* * */

import { GtfsStrictV30SteppAgencySchema, GtfsStrictV30SteppRoutesSchema, GtfsStrictV30SteppRouteSteppSchema, GtfsStrictV30SteppShapesSchema, GtfsStrictV30SteppStopsSchema, GtfsStrictV30SteppStopTimesSchema, GtfsStrictV30SteppTripsSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
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

interface SharedRow {
	activeFrom: number
	createdAt: number
	endDate: string
	planId: string
	row: OutputRow
	startDate: string
}

export interface PlanExportConfig {
	agencyCode: string
	endDate: string
	namespaceIds: boolean
	planActiveFrom: number
	planCreatedAt: number
	planId: string
	sharedRows: Map<string, SharedRow>
	sourceDirectory: string
	startDate: string
	writers: SteppWriters
}

const CONTRACTS: Record<string, string> = { 41: 'TML 24/2020', 42: 'TML 25/2020', 43: 'TML 26/2020', 44: 'TML 27/2020' };

/* * */

/**
 * Returns the value of the given field in the given row.
 * @param row - The row to get the value from.
 * @param field - The field to get the value from.
 * @returns The value of the given field in the given row.
 */
function required(row: Row, field: string): string {
	const value = row[field];
	if (!value) throw new Error(`Missing ${field} in ${JSON.stringify(row)}`);
	return value;
}

/**
 * Converts a string to a number.
 * @param value - The string to convert.
 * @returns The number of the given string.
 */
function number(value: string | undefined): number | undefined {
	return value === undefined || value === '' ? undefined : Number(value);
}

/**
 * Picks the given fields from the given row.
 * @param row - The row to pick the fields from.
 * @param fields - The fields to pick.
 * @returns A new row with the picked fields.
 */
function pick(row: Row, fields: string[]): Row {
	return Object.fromEntries(fields.map(field => [field, row[field] ?? '']));
}

/**
 * Returns the row with the given ID from the given map.
 * @param rows - The map to get the row from.
 * @param id - The ID of the row to get.
 * @param table - The table the row is from.
 * @returns The row with the given ID from the given map.
 */
function referenced<T>(rows: Map<string, T>, id: string, table: string): T {
	const row = rows.get(id);
	if (row === undefined) throw new Error(`Missing ${table} "${id}"`);
	return row;
}

/**
 * Reads a CSV file.
 * @param config - The configuration of the plan export.
 * @param name - The name of the CSV file to read.
 * @param callback - The callback to call for each row.
 * @param optional - Whether the CSV file is optional.
 */
async function readCsv(config: PlanExportConfig, name: string, callback: (row: Row) => Promise<void>, optional = false) {
	const filePath = path.join(config.sourceDirectory, `${name}.txt`);
	const prefix = `[STePP plan ${config.planId}]`;
	if (optional && !fs.existsSync(filePath)) {
		Logger.info(`${prefix} Optional ${name}.txt is absent; using the available GTFS fields and defaults.`);
		return;
	}
	const timer = new Timer();
	let recordsRead = 0;
	Logger.info(`${prefix} Reading ${name}.txt...`);
	try {
		await streamCsvFile<Row>(filePath, async (row) => {
			recordsRead++;
			await callback(row);
		});
		Logger.info({
			attributes: { duration_ms: timer.getMs(), file: `${name}.txt`, plan_id: config.planId, records_read: recordsRead },
			message: `${prefix} Read ${recordsRead} records from ${name}.txt in ${timer.get()}.`,
		});
	} catch (error) {
		throw new Error(`${prefix} Could not export ${name}.txt (${recordsRead} CSV records read): ${error instanceof Error ? error.message : error}`, { cause: error });
	}
}

/**
 * Reads a CSV file by the given field.
 * @param config - The configuration of the plan export.
 * @param name - The name of the CSV file to read.
 * @param field - The field to read the rows by.
 * @returns A map of the IDs to the rows.
 */
async function readById(config: PlanExportConfig, name: string, field: string): Promise<Map<string, Row>> {
	const rows = new Map<string, Row>();
	await readCsv(config, name, async (row) => {
		const id = required(row, field);
		if (rows.has(id)) throw new Error(`Duplicate ${field} "${id}"`);
		rows.set(id, row);
	});
	return rows;
}

/**
 * Returns the source row for the given row.
 * @param config - The configuration of the plan export.
 * @param row - The row to get the source row for.
 * @returns The source row for the given row.
 */
function rowSource(config: PlanExportConfig, row: OutputRow): SharedRow {
	return { activeFrom: config.planActiveFrom, createdAt: config.planCreatedAt, endDate: config.endDate, planId: config.planId, row: { ...row }, startDate: config.startDate };
}

/**
 * Uses original plan dates, since clipping can give several plans the same export start.
 * @param current - The current shared row.
 * @param previous - The previous shared row.
 * @returns Whether the current shared row is newer than the previous shared row.
 */
function isNewerSource(current: SharedRow, previous: SharedRow): boolean {
	if (current.activeFrom !== previous.activeFrom) return current.activeFrom > previous.activeFrom;
	if (current.createdAt !== previous.createdAt) return current.createdAt > previous.createdAt;
	return current.planId > previous.planId;
}

/**
 * Keeps public IDs stable and lets the latest plan supply route and stop names.
 * @param config - The configuration of the plan export.
 * @param table - The table to merge the shared row for.
 * @param id - The ID of the row to merge.
 * @param row - The row to merge.
 */
function mergeSharedRow(config: PlanExportConfig, table: 'agency' | 'routes' | 'stops', id: string, row: OutputRow) {
	const key = `${table}:${id}`;
	const signature = JSON.stringify(row);
	const current = rowSource(config, row);
	const previous = config.sharedRows.get(key);
	if (previous !== undefined && JSON.stringify(previous.row) !== signature) {
		const fields = new Set([...Object.keys(previous.row), ...Object.keys(row)]);
		const differences = Array.from(fields)
			.filter(field => previous.row[field] !== row[field])
			.map(field => ({ current: row[field] ?? null, field, previous: previous.row[field] ?? null }));
		const idField = { agency: 'agency_id', routes: 'route_id', stops: 'stop_id' }[table];
		const mutableNames: string[] = { agency: [], routes: ['route_long_name', 'route_short_name'], stops: ['stop_name'] }[table];
		if (differences.every(diff => mutableNames.includes(diff.field))) {
			const replace = isNewerSource(current, previous);
			const chosen = replace ? current : previous;
			Logger.info({
				attributes: {
					chosen_plan_id: chosen.planId,
					current_active_from: current.activeFrom,
					current_plan_id: current.planId,
					differences,
					event: 'operation_gtfs_stepp.name_merge',
					file: `${table}.txt`,
					id,
					previous_active_from: previous.activeFrom,
					previous_plan_id: previous.planId,
					replaced: replace,
				},
				message: [
					`${replace ? 'Updated' : 'Kept'} ${table}.txt names for ${idField} ${JSON.stringify(id)} using newer plan ${JSON.stringify(chosen.planId)} (active_from ${chosen.activeFrom}).`,
					...differences.map(diff => `  ${diff.field}: plan ${JSON.stringify(previous.planId)} = ${JSON.stringify(diff.previous)}; plan ${JSON.stringify(current.planId)} = ${JSON.stringify(diff.current)}`),
				].join('\n'),
			});
			if (replace) config.sharedRows.set(key, current);
			return;
		}
		const message = [
			`Cannot merge conflicting ${table}.txt data for ${idField} ${JSON.stringify(id)}.`,
			`Retained definition: plan ${JSON.stringify(previous.planId)}, exported dates ${previous.startDate}–${previous.endDate}.`,
			`Conflicting definition: plan ${JSON.stringify(config.planId)}, exported dates ${config.startDate}–${config.endDate}.`,
			`Different fields (${differences.length}):`,
			...differences.map(diff => `  ${diff.field}: plan ${JSON.stringify(previous.planId)} = ${JSON.stringify(diff.previous)}; plan ${JSON.stringify(config.planId)} = ${JSON.stringify(diff.current)}`),
			`The merged feed permits route and stop name changes, but other fields must agree for the same ${idField}. Compare these fields in the two normalized plan attachments.`,
		].join('\n');
		Logger.error({
			attributes: {
				current_plan_id: config.planId,
				current_row: row,
				differences,
				event: 'operation_gtfs_stepp.shared_row_conflict',
				file: `${table}.txt`,
				id,
				previous_plan_id: previous.planId,
				previous_row: previous.row,
			},
			message,
		});
		throw new Error(message);
	}
	// Advance the name source even when values match, so an older plan cannot undo it later.
	if (previous === undefined || (table !== 'agency' && isNewerSource(current, previous))) config.sharedRows.set(key, current);
}

/* * */

/**
 * Writes one final definition per public ID after every plan has been merged.
 * @param sharedRows - The shared rows to write.
 * @param writers - The writers to write the shared rows to.
 */
export async function writeSharedFiles(sharedRows: PlanExportConfig['sharedRows'], writers: SteppWriters) {
	for (const table of ['agency', 'routes', 'stops'] as const) {
		for (const [key, source] of sharedRows) {
			if (key.startsWith(`${table}:`)) await writers[table].write(source.row);
		}
	}
}

/**
 * Converts one normalized Operation plan into the shared STePP feed.
 * @param config - The configuration of the plan export.
 * @returns The number of trips exported.
 */
export async function exportPlanGtfs(config: PlanExportConfig): Promise<number> {
	const { sourceDirectory, writers } = config;
	const timer = new Timer();
	const prefix = `[STePP plan ${config.planId}]`;
	Logger.info(`${prefix} Resolving service dates inside ${config.startDate}–${config.endDate}...`);
	const services = await readServiceDates(sourceDirectory, config.startDate, config.endDate);
	Logger.info(`${prefix} Found ${services.size} services with operating dates in the export range.`);
	const routes = await readById(config, 'routes', 'route_id');
	const trips = new Map<string, Trip>();
	const usedRoutes = new Set<string>();
	const usedServices = new Set<string>();
	const usedShapes = new Set<string>();
	const usedStops = new Set<string>();
	let skippedTrips = 0;
	let exportedStopTimes = 0;
	let exportedShapePoints = 0;

	// Only internal identifiers need a plan namespace. Stops and routes keep their public IDs.
	const scopedId = (id: string) => config.namespaceIds ? `plan_${encodeURIComponent(config.planId)}:${encodeURIComponent(id)}` : id;

	await readCsv(config, 'trips', async (row) => {
		if (!services.get(required(row, 'service_id'))?.size) {
			skippedTrips++;
			return;
		}
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

	Logger.info(`${prefix} Selected ${trips.size} trips, ${usedRoutes.size} routes, ${usedServices.size} services and ${usedShapes.size} shapes; skipped ${skippedTrips} trips with no service in the range.`);
	if (trips.size === 0) {
		Logger.warning(`${prefix} No active trips in ${config.startDate}–${config.endDate}; this plan contributes no rows.`);
		return 0;
	}

	const agencies = await readById(config, 'agency', 'agency_id');
	const sourceAgency = agencies.get(config.agencyCode);
	if (!sourceAgency) throw new Error(`Plan "${config.planId}" has no agency "${config.agencyCode}" in agency.txt`);
	const agency = pick(sourceAgency, ['agency_id', 'agency_name', 'agency_url', 'agency_timezone', 'agency_lang', 'agency_phone', 'agency_fare_url', 'agency_email']);
	agency.agency_timezone ||= 'Europe/Lisbon';
	agency.agency_lang ||= 'pt';
	GtfsStrictV30SteppAgencySchema.parse({ ...agency, agency_url: agency.agency_url || undefined });
	mergeSharedRow(config, 'agency', config.agencyCode, agency);

	// Stream the large tables; retain only the endpoint references needed by routes_stepp.
	await readCsv(config, 'stop_times', async (row) => {
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
		exportedStopTimes++;
	});

	const stops = new Map<string, Row>();
	await readCsv(config, 'stops', async (row) => {
		const id = required(row, 'stop_id');
		if (!usedStops.has(id)) return;
		if (stops.has(id)) throw new Error(`Duplicate stop_id "${id}"`);
		const stop = pick(row, ['stop_id', 'stop_code', 'stop_name', 'stop_desc', 'stop_lat', 'stop_lon', 'zone_id']);
		GtfsStrictV30SteppStopsSchema.parse({ ...stop, stop_lat: number(stop.stop_lat), stop_lon: number(stop.stop_lon) });
		stops.set(id, stop);
		mergeSharedRow(config, 'stops', id, stop);
	});
	for (const id of usedStops) if (!stops.has(id)) throw new Error(`Missing stop "${id}" referenced by stop_times.txt`);

	const foundShapes = new Set<string>();
	await readCsv(config, 'shapes', async (row) => {
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
		exportedShapePoints++;
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

	Logger.info(`${prefix} Merging ${usedRoutes.size} routes into routes.txt and checking definitions from earlier plans...`);
	for (const id of usedRoutes) {
		const route = pick(referenced(routes, id, 'route'), ['route_id', 'agency_id', 'route_short_name', 'route_long_name', 'route_desc', 'route_type']);
		GtfsStrictV30SteppRoutesSchema.parse(route);
		mergeSharedRow(config, 'routes', id, route);
	}

	const routeExtensions = new Map<string, Row[]>();
	await readCsv(config, 'routes_stepp', async (row) => {
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
			config.sharedRows.set(key, rowSource(config, output));
			await writers.routes_stepp.write(output);
		}
	}

	for (const id of usedServices) {
		const { calendar, calendarDates } = buildCalendarRows(scopedId(id), referenced(services, id, 'service'));
		await writers.calendar.write(calendar);
		for (const row of calendarDates) await writers.calendar_dates.write(row);
	}
	Logger.success({
		attributes: { duration_ms: timer.getMs(), plan_id: config.planId, routes: usedRoutes.size, services: usedServices.size, shape_points: exportedShapePoints, stop_times: exportedStopTimes, stops: usedStops.size, trips: trips.size },
		message: `${prefix} Prepared ${trips.size} trips, ${exportedStopTimes} stop times, ${usedStops.size} referenced stops, ${exportedShapePoints} shape points and ${usedServices.size} calendars in ${timer.get()}.`,
	});
	return trips.size;
}
