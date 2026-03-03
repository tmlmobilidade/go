/* * */

import { zones } from '@tmlmobilidade/interfaces';

import { fetchTypologiesByAgencyIds } from './fetchers/typology.js';
import { type ImportOptions } from './types.js';
import { buildAfectacaoMaps, loadAfectacao } from './utils/afetacao.js';
import { loadGtfsRoutes } from './utils/routes.js';
import { loadGtfsShapes } from './utils/shapes.js';
import { buildStopTimesByTrip, loadGtfsStopTimes } from './utils/stop-times.js';
import { buildTripsByRouteAndDirection, loadGtfsTrips } from './utils/trips.js';
import { buildTypologyColorMap } from './utils/typology.js';

/* * */

export interface ImportContext {
	agencyIds: string[]
	gtfsRoutes: Awaited<ReturnType<typeof loadGtfsRoutes>>
	gtfsShapes: Awaited<ReturnType<typeof loadGtfsShapes>>
	gtfsStopTimes: Awaited<ReturnType<typeof loadGtfsStopTimes>>
	gtfsTrips: Awaited<ReturnType<typeof loadGtfsTrips>>
	interchangeByLineId: Map<string, string>
	shapesById: Map<string, { extension: number, geojson: { geometry: { coordinates: number[][], type: 'LineString' }, type: 'Feature' } }>
	stopTimesByTrip: ReturnType<typeof buildStopTimesByTrip>
	tripsByRoute: ReturnType<typeof buildTripsByRouteAndDirection>['tripsByRoute']
	tripsByRouteAndDirection: ReturnType<typeof buildTripsByRouteAndDirection>['tripsByRouteAndDirection']
	typologyMap: ReturnType<typeof buildTypologyColorMap>
	zoneIdByCode: Map<string, string>
	zonesByPatternStop: Map<string, string[]>
	zonesByStop: Map<string, string[]>
}

/* * */

export async function buildImportContext(options: ImportOptions): Promise<ImportContext> {
	//
	// A. Load raw GTFS + afetacao data

	const gtfsRoutesAll = await loadGtfsRoutes(options.gtfsPath);
	const gtfsTripsAll = await loadGtfsTrips(options.gtfsPath);
	const gtfsStopTimesAll = await loadGtfsStopTimes(options.gtfsPath);
	const gtfsShapesAll = await loadGtfsShapes(options.gtfsPath);

	let afetacaoRows: Awaited<ReturnType<typeof loadAfectacao>> = [];
	try {
		afetacaoRows = await loadAfectacao(options.gtfsPath);
		console.log('[gtfs-importer] Loaded afetacao', { rows: afetacaoRows.length });
	} catch (error) {
		console.warn(`[gtfs-importer] Missing afetacao.csv or failed to parse: ${error instanceof Error ? error.message : String(error)}`);
	}

	//
	// B. Filter GTFS by agency (if specified)

	const agencyIds = [...new Set(gtfsRoutesAll.map(route => route.agency_id).filter(Boolean))];
	const agencyIdSet = new Set(agencyIds);

	const gtfsRoutes = gtfsRoutesAll.filter(route => agencyIdSet.has(route.agency_id));
	const routeIdSet = new Set(gtfsRoutes.map(route => route.route_id));
	const gtfsTrips = gtfsTripsAll.filter(trip => routeIdSet.has(trip.route_id));
	const tripIdSet = new Set(gtfsTrips.map(trip => trip.trip_id));
	const gtfsStopTimes = gtfsStopTimesAll.filter(stopTime => tripIdSet.has(stopTime.trip_id));
	const gtfsShapes = gtfsShapesAll;

	console.log('[gtfs-importer] Loaded GTFS data', {
		routes: gtfsRoutes.length,
		shapes: gtfsShapes.length,
		stopTimes: gtfsStopTimes.length,
		trips: gtfsTrips.length,
	});

	console.log('[gtfs-importer] Resolved agency IDs', { agencyIds });

	//
	// C. Load typologies + zones

	const typologies = await fetchTypologiesByAgencyIds(agencyIds);
	const typologyMap = buildTypologyColorMap(typologies);
	console.log('[gtfs-importer] Loaded typologies', {
		count: typologies.length,
		mappedColors: typologyMap.size,
	});

	const zoneDocs = await zones.findMany({});
	const zoneIdByCode = new Map<string, string>();
	for (const zone of zoneDocs) {
		if (!zone.code) continue;
		zoneIdByCode.set(String(zone.code).trim(), zone._id);
	}
	console.log('[gtfs-importer] Loaded zones', { count: zoneIdByCode.size });

	//
	// D. Build indexes for quick access

	const { tripsByRoute, tripsByRouteAndDirection } = buildTripsByRouteAndDirection(gtfsTrips);
	const stopTimesByTrip = buildStopTimesByTrip(gtfsStopTimes);
	const { interchangeByLineId, zonesByPatternStop, zonesByStop } = buildAfectacaoMaps(afetacaoRows);
	const shapesById = new Map<string, { extension: number, geojson: { geometry: { coordinates: number[][], type: 'LineString' }, type: 'Feature' } }>();
	const shapesGrouped = new Map<string, typeof gtfsShapes>();
	for (const shape of gtfsShapes) {
		if (!shapesGrouped.has(shape.shape_id)) shapesGrouped.set(shape.shape_id, []);
		shapesGrouped.get(shape.shape_id)?.push(shape);
	}
	for (const [shapeId, points] of shapesGrouped.entries()) {
		const sorted = [...points].sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
		const coordinates = sorted.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
		const maxDist = sorted.reduce((acc, point) => Math.max(acc, point.shape_dist_traveled ?? 0), 0);
		shapesById.set(shapeId, {
			extension: Math.round(maxDist * 1000),
			geojson: {
				geometry: {
					coordinates,
					type: 'LineString',
				},
				type: 'Feature',
			},
		});
	}

	return {
		agencyIds,
		gtfsRoutes,
		gtfsShapes,
		gtfsStopTimes,
		gtfsTrips,
		interchangeByLineId,
		shapesById,
		stopTimesByTrip,
		tripsByRoute,
		tripsByRouteAndDirection,
		typologyMap,
		zoneIdByCode,
		zonesByPatternStop,
		zonesByStop,
	};
}
