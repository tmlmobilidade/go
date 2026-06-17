/* * */

import { lines, patterns, routes } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import { INTERCHANGE_MODE } from '@tmlmobilidade/types';

import { fetchAllEvents } from './fetchers/events.js';
import { buildPatternsForRoute, insertPatterns } from './imports/patterns.js';
import { buildScheduleRulesForRoute } from './imports/schedules.js';
import { buildImportContext } from './index.context.js';
import { type ImportOptions, type ImportSummary } from './types.js';
import { buildLineFromRoute, resolveLineCode } from './utils/lines.js';
import { buildRoutesForLine } from './utils/routes.js';
import { printWarningSummary, warn, WARNING } from './warnings.js';

/* * */

export async function importGtfs(options: ImportOptions): Promise<ImportSummary> {
	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'gtfs-importer', message: 'Sentry Offer GTFS Importer initialized', module: 'offer', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Offer GTFS Importer' });
	}

	//
	// A. Start / log input

	// Logger.info('[gtfs-importer] Starting lines/routes import', {
	// 	gtfsPath: options.gtfsPath,
	// });

	//
	// B. Build import context (GTFS data + indexes)

	const context = await buildImportContext(options);
	const {
		gtfsRoutes,
		interchangeByLineId,
		shapesById,
		stopTimesByTrip,
		tripsByRoute,
		typologyMap,
		zoneIdByCode,
		zonesByPatternStop,
		zonesByStop,
	} = context;

	//
	// C. Cleanup existing data for agencies being imported

	const agencyIds = [...new Set(gtfsRoutes.map(route => route.agency_id).filter(Boolean))];
	const existingLines = await lines.findByAgencyIds(agencyIds);

	const lineIds = existingLines.map(line => line._id);

	if (lineIds.length) {
		await patterns.deleteMany({ line_id: { $in: lineIds } });
		await routes.deleteMany({ line_id: { $in: lineIds } });
		await lines.deleteMany({ _id: { $in: lineIds } });
	}

	// Fetch events

	const allEventsMap = await fetchAllEvents(agencyIds[0]);
	const events = [...allEventsMap.values()];

	//
	// D. Group GTFS routes by canonical line code

	const gtfsRoutesByLineCode = new Map<string, typeof gtfsRoutes>();
	for (const gtfsRoute of gtfsRoutes) {
		const lineCode = resolveLineCode(gtfsRoute);
		if (!gtfsRoutesByLineCode.has(lineCode)) gtfsRoutesByLineCode.set(lineCode, []);
		gtfsRoutesByLineCode.get(lineCode)?.push(gtfsRoute);
	}

	let linesCreated = 0;
	let patternsCreated = 0;
	let routesCreated = 0;
	let routesInGtfs = 0;
	let patternsInGtfs = 0;
	const lineCodesInGtfs = new Set<string>();
	const stopCache = new Map<string, { _id: string, name: string }>();
	const missingZoneCodes = new Set<string>();

	//
	// E. Process each line: build all data, then insert line → routes → patterns → schedules

	for (const [lineCodeKey, lineRoutes] of gtfsRoutesByLineCode.entries()) {
		const [primaryRoute] = lineRoutes;
		if (!primaryRoute) continue;

		const agencyId = primaryRoute.agency_id;
		const interchangeMode = interchangeByLineId.get(String(primaryRoute.line_id)) as typeof INTERCHANGE_MODE[keyof typeof INTERCHANGE_MODE] ?? INTERCHANGE_MODE.NONE;
		const lineInput = buildLineFromRoute(primaryRoute, agencyId, typologyMap, primaryRoute.route_color, interchangeMode);
		lineCodesInGtfs.add(lineInput.code);

		// Logger.info('[gtfs-importer] Processing line', {
		// 	agency_id: agencyId,
		// 	line_code: lineCodeKey,
		// 	line_id: primaryRoute.line_id,
		// 	line_long_name: primaryRoute.line_long_name,
		// 	line_short_name: primaryRoute.line_short_name,
		// 	resolved_line_code: lineInput.code,
		// 	typology_id: lineInput.typology,
		// });

		//
		// E.1 Insert line

		const lineDoc = await lines.insertOne(lineInput);
		linesCreated += 1;
		const lineId = lineDoc._id;
		// Logger.info('[gtfs-importer] Line created', {
		// 	code: lineInput.code,
		// 	line_id: lineDoc._id,
		// });

		const lineCode = lineInput.code;
		const lineName = lineInput.name;

		//
		// E.2 Build and insert routes for this line

		const routeIdSet = new Set(lineRoutes.map(route => route.route_id));

		const routeInputs = buildRoutesForLine(lineId, lineName, lineRoutes);
		routesInGtfs += routeInputs.length;

		const routeDocsByCode = new Map<string, { _id: string }>();
		for (const routeInput of routeInputs) {
			const routeDoc = await routes.insertOne(routeInput);
			routesCreated += 1;
			routeDocsByCode.set(routeInput.code, { _id: routeDoc._id });
			// Logger.info('[gtfs-importer] Route created', {
			// 	code: routeInput.code,
			// 	line_id: lineId,
			// });
		}

		//
		// E.3 Build pattern data (pure computation)

		const routeTrips = [...routeIdSet].flatMap(routeId => tripsByRoute.get(routeId) ?? []);
		const patternsResult = await buildPatternsForRoute({
			lineCode,
			lineId,
			missingZoneCodes,
			routeDocsByCode,
			routeTrips,
			shapesById,
			stopCache,
			stopTimesByTrip,
			zoneIdByCode,
			zonesByPatternStop,
			zonesByStop,
		});
		patternsInGtfs += patternsResult.patternsInGtfs;

		//
		// E.4 Build schedule rules (pure computation) and merge into pattern DTOs

		const { rulesByPatternKey, unknownServiceIds } = buildScheduleRulesForRoute({
			events,
			routeId: lineInput.code,
			routeTrips,
			stopTimesByTrip,
		});

		for (const builtPattern of patternsResult.builtPatterns) {
			const rules = rulesByPatternKey.get(builtPattern.patternKey);
			if (rules?.length) {
				builtPattern.input.rules = rules;
			}
		}

		if (unknownServiceIds.size) {
			for (const serviceId of unknownServiceIds) {
				warn(WARNING.UNKNOWN_SERVICE_ID, { line_code: lineInput.code, service_id: serviceId });
			}
		}

		//
		// E.5 Insert patterns (with rules already populated)

		const { patternsCreated: linePatterns } = await insertPatterns(patternsResult.builtPatterns);
		patternsCreated += linePatterns;
	}

	if (missingZoneCodes.size) {
		for (const code of missingZoneCodes) {
			warn(WARNING.MISSING_ZONE_CODE, { code });
		}
	}

	// Logger.info('[gtfs-importer] Import finished', {
	// 	linesCreated,
	// 	linesInGtfs: lineCodesInGtfs.size,
	// 	patternsCreated,
	// 	patternsInGtfs,
	// 	routesCreated,
	// 	routesInGtfs,
	// });

	printWarningSummary();

	return {
		linesCreated,
		linesInGtfs: lineCodesInGtfs.size,
		patternsCreated,
		patternsInGtfs,
		routesCreated,
		routesInGtfs,
	};
}
