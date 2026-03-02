/* * */

import { lines, patterns, routes, stops, zones } from '@tmlmobilidade/interfaces';
import { type CreateLineDto, type CreatePatternDto, type CreateRouteDto, GtfsTMLRoute, HHMM, INTERCHANGE_MODE, type ManualRule, OPERATING_MODE, PATH_TYPE, TRANSPORT_TYPE, type Typology } from '@tmlmobilidade/types';

import { CalendarRulesCM } from '../config/cm/calendarRules.js';
import { fetchTypologiesByAgencyIds } from '../fetchers/typology.js';
import { type ImportOptions, type ImportSummary } from '../types.js';
import { buildTypologyColorMap, loadAfectacao, loadGtfsRoutes, loadGtfsStopTimes, loadGtfsTripsWithPattern, normalizeHexColor, truncate } from '../utils.js';

/* * */

function normalizeLineCode(value: string) {
	return truncate(value.trim(), 10);
}

function normalizeName(value: string) {
	return value.trim();
}

function buildLineFromRoute(route: GtfsTMLRoute, agencyId: string, typologyMap: Map<string, Typology>, routeColor?: string): CreateLineDto {
	const lineCode = normalizeLineCode(route.route_short_name || route.route_id);
	const lineName = normalizeName(route.route_long_name || route.route_short_name || route.route_id);
	const typology = routeColor ? typologyMap.get(normalizeHexColor(routeColor) ?? '') : undefined;
	const transportType = Object.values(TRANSPORT_TYPE).includes(String(route.route_type) as (typeof TRANSPORT_TYPE)[keyof typeof TRANSPORT_TYPE])
		? String(route.route_type)
		: TRANSPORT_TYPE.BUS;

	return {
		agency_id: agencyId,
		code: lineCode,
		created_by: 'system',
		interchange: INTERCHANGE_MODE.CONFIGURED,
		is_circular_line: route.circular === 1,
		is_locked: false,
		is_school_line: route.school === 1,
		name: lineName,
		onboard_fare_ids: typology?.default_onboard_fare_ids ?? [],
		prepaid_fare_id: typology?.default_prepaid_fare_id ?? null,
		transport_type: transportType as typeof TRANSPORT_TYPE[keyof typeof TRANSPORT_TYPE],
		typology: typology?._id ?? null,
	};
}

function buildRoutesForLine(lineId: string, lineCode: string, lineName: string, directions: { directionId: string, headsign?: string }[]): CreateRouteDto[] {
	if (!directions.length) {
		const baseCode = normalizeLineCode(`${lineCode}_0`);
		return [{
			code: baseCode,
			created_by: 'system',
			is_locked: false,
			line_id: lineId,
			name: normalizeName(lineName),
			path_type: PATH_TYPE.BASE,
		}];
	}

	return directions.map((direction) => {
		const code = normalizeLineCode(`${lineCode}_${direction.directionId}`);
		return {
			code,
			created_by: 'system',
			is_locked: false,
			line_id: lineId,
			name: normalizeName(direction.headsign || lineName),
			path_type: PATH_TYPE.BASE,
		};
	});
}

function resolveAgencyIds(options: ImportOptions, gtfsAgencyIds: string[]) {
	if (options.agencyIds?.length) return options.agencyIds;
	return gtfsAgencyIds;
}

async function getStopByLegacyId(legacyId: string, cache: Map<string, { _id: string, name: string }>) {
	const cached = cache.get(legacyId);
	if (cached) return cached;
	const stop = await stops.findOne({ legacy_id: legacyId });
	if (!stop) return null;
	const entry = { _id: stop._id, name: stop.name };
	cache.set(legacyId, entry);
	return entry;
}

function buildPatternCode(lineCode: string, directionId: string, index: number) {
	return truncate(`${lineCode}_${directionId}_${index}`, 10);
}

function resolvePatternKey(directionId: string, patternId: null | string, fingerprint: string) {
	return patternId ? `pid:${directionId}:${patternId}` : `fp:${directionId}:${fingerprint}`;
}

function resolvePatternCode(lineCode: string, directionId: string, patternId: null | string, index: number) {
	if (patternId) return truncate(patternId, 10);
	return buildPatternCode(lineCode, directionId, index);
}

function normalizeGtfsTimeToHHMM(time?: string) {
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

function normalizeGtfsDistance(value?: null | number | string) {
	if (value === null || value === undefined) return null;
	const num = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
	if (!Number.isFinite(num)) return null;
	return num;
}

function normalizeGtfsTimeToSeconds(time?: string) {
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

export async function importLinesAndRoutes(options: ImportOptions): Promise<ImportSummary> {
	console.log('[gtfs-importer] Starting lines/routes import', {
		agencyIds: options.agencyIds,
		dryRun: options.dryRun,
		gtfsPath: options.gtfsPath,
	});

	const gtfsRoutesAll = await loadGtfsRoutes(options.gtfsPath);
	const gtfsTripsAll = await loadGtfsTripsWithPattern(options.gtfsPath);
	const gtfsStopTimesAll = await loadGtfsStopTimes(options.gtfsPath);
	let afetacaoRows: Awaited<ReturnType<typeof loadAfectacao>> = [];
	try {
		afetacaoRows = await loadAfectacao(options.gtfsPath);
		console.log('[gtfs-importer] Loaded afetacao', { rows: afetacaoRows.length });
	} catch (error) {
		console.warn(`[gtfs-importer] Missing afetacao.csv or failed to parse: ${error instanceof Error ? error.message : String(error)}`);
	}

	const gtfsAgencyIds = [...new Set(gtfsRoutesAll.map(route => route.agency_id).filter(Boolean))];
	const agencyIds = resolveAgencyIds(options, gtfsAgencyIds);
	const agencyIdSet = new Set(agencyIds);

	const gtfsRoutes = gtfsRoutesAll.filter(route => agencyIdSet.has(route.agency_id));
	const routeIdSet = new Set(gtfsRoutes.map(route => route.route_id));
	const gtfsTrips = gtfsTripsAll.filter(trip => routeIdSet.has(trip.route_id));
	const tripIdSet = new Set(gtfsTrips.map(trip => trip.trip_id));
	const gtfsStopTimes = gtfsStopTimesAll.filter(stopTime => tripIdSet.has(stopTime.trip_id));

	console.log('[gtfs-importer] Loaded GTFS data', {
		routes: gtfsRoutes.length,
		stopTimes: gtfsStopTimes.length,
		trips: gtfsTrips.length,
	});

	console.log('[gtfs-importer] Resolved agency IDs', { agencyIds, gtfsAgencyIds });

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

	const tripsByRouteAndDirection = new Map<string, { directionId: string, headsign?: string }>();
	const tripsByRoute = new Map<string, typeof gtfsTrips>();
	for (const trip of gtfsTrips) {
		const directionId = String(trip.direction_id ?? '0');
		const key = `${trip.route_id}:${directionId}`;
		if (!tripsByRouteAndDirection.has(key)) {
			tripsByRouteAndDirection.set(key, { directionId, headsign: trip.trip_headsign });
		}
		if (!tripsByRoute.has(trip.route_id)) tripsByRoute.set(trip.route_id, []);
		tripsByRoute.get(trip.route_id)?.push(trip);
	}

	const stopTimesByTrip = new Map<string, typeof gtfsStopTimes>();
	for (const stopTime of gtfsStopTimes) {
		if (!stopTimesByTrip.has(stopTime.trip_id)) stopTimesByTrip.set(stopTime.trip_id, []);
		stopTimesByTrip.get(stopTime.trip_id)?.push(stopTime);
	}
	for (const [tripId, stopTimes] of stopTimesByTrip.entries()) {
		stopTimes.sort((a, b) => a.stop_sequence - b.stop_sequence);
		stopTimesByTrip.set(tripId, stopTimes);
	}

	const zonesByPatternStop = new Map<string, string[]>();
	const zonesByStop = new Map<string, string[]>();
	const interchangeByLineId = new Map<string, string>();
	const mergeZones = (existing: string[] | undefined, codes: string[]) => {
		const merged = new Set(existing ?? []);
		for (const code of codes) merged.add(code);
		return [...merged];
	};
	for (const row of afetacaoRows) {
		if (row.line_id !== null && row.line_id !== undefined && row.interchange !== null && row.interchange !== undefined) {
			const lineId = String(row.line_id).trim();
			const interchange = String(row.interchange).trim();
			if (lineId && interchange) {
				interchangeByLineId.set(lineId, interchange);
			}
		}
		if (!row.accepted_zone_codes || !row.stop_id) continue;
		const codes = row.accepted_zone_codes.split('|').map(code => code.trim()).filter(Boolean);
		if (!codes.length) continue;
		const stopId = row.stop_id.trim();
		if (row.pattern_id) {
			const key = `${row.pattern_id.trim()}:${stopId}`;
			zonesByPatternStop.set(key, mergeZones(zonesByPatternStop.get(key), codes));
		}
		zonesByStop.set(stopId, mergeZones(zonesByStop.get(stopId), codes));
	}

	let linesCreated = 0;
	let linesUpdated = 0;
	let patternsCreated = 0;
	let patternsUpdated = 0;
	let routesCreated = 0;
	let routesUpdated = 0;
	const stopCache = new Map<string, { _id: string, name: string }>();
	const missingZoneCodes = new Set<string>();

	for (const gtfsRoute of gtfsRoutes) {
		const agencyId = gtfsRoute.agency_id;
		const lineInput = buildLineFromRoute(gtfsRoute, agencyId, typologyMap, gtfsRoute.route_color);
		const interchangeMode = interchangeByLineId.get(String(gtfsRoute.line_id)) ?? INTERCHANGE_MODE.NONE;
		lineInput.interchange = (Object.values(INTERCHANGE_MODE).includes(interchangeMode as typeof INTERCHANGE_MODE[keyof typeof INTERCHANGE_MODE])
			? interchangeMode
			: INTERCHANGE_MODE.NONE) as typeof INTERCHANGE_MODE[keyof typeof INTERCHANGE_MODE];

		console.log('[gtfs-importer] Processing route', {
			agency_id: agencyId,
			resolved_line_code: lineInput.code,
			route_id: gtfsRoute.route_id,
			route_long_name: gtfsRoute.route_long_name,
			route_short_name: gtfsRoute.route_short_name,
			typology_id: lineInput.typology,
		});

		const existingLine = await lines.findOne({ agency_id: agencyId, code: lineInput.code });
		let lineId = existingLine?._id ?? null;

		if (!options.dryRun) {
			if (existingLine) {
				const updatedLine = await lines.updateById(existingLine._id, lineInput, { forceIfLocked: true });
				linesUpdated += 1;
				lineId = updatedLine._id;
				console.log('[gtfs-importer] Line updated', {
					code: lineInput.code,
					line_id: updatedLine._id,
				});
			} else {
				const lineDoc = await lines.insertOne(lineInput);
				linesCreated += 1;
				lineId = lineDoc._id;
				console.log('[gtfs-importer] Line created', {
					code: lineInput.code,
					line_id: lineDoc._id,
				});
			}
		} else {
			console.log('[gtfs-importer] Line dry-run', {
				action: existingLine ? 'update' : 'create',
				code: lineInput.code,
				line_id: existingLine?._id ?? null,
			});
		}

		if (!lineId) {
			console.log('[gtfs-importer] Line missing ID, skipping routes', {
				code: lineInput.code,
			});
			continue;
		}

		const lineCode = lineInput.code;
		const lineName = lineInput.name;

		const directions = [...tripsByRouteAndDirection.entries()]
			.filter(([key]) => key.startsWith(`${gtfsRoute.route_id}:`))
			.map(([, value]) => value);
		console.log('[gtfs-importer] Directions', { count: directions.length, route_id: gtfsRoute.route_id });

		const routeInputs = buildRoutesForLine(lineId, lineCode, lineName, directions);
		console.log('[gtfs-importer] Routes to upsert', { count: routeInputs.length });
		const routeDocsByCode = new Map<string, { _id: string }>();

		for (const routeInput of routeInputs) {
			const existingRoute = await routes.findOne({ code: routeInput.code, line_id: lineId });
			if (!options.dryRun) {
				if (existingRoute) {
					await routes.updateById(existingRoute._id, routeInput, { forceIfLocked: true });
					routesUpdated += 1;
					routeDocsByCode.set(routeInput.code, { _id: existingRoute._id });
					console.log('[gtfs-importer] Route updated', {
						code: routeInput.code,
						line_id: lineId,
					});
				} else {
					const routeDoc = await routes.insertOne(routeInput);
					routesCreated += 1;
					routeDocsByCode.set(routeInput.code, { _id: routeDoc._id });
					console.log('[gtfs-importer] Route created', {
						code: routeInput.code,
						line_id: lineId,
					});
				}
			} else {
				if (existingRoute) routeDocsByCode.set(routeInput.code, { _id: existingRoute._id });
				console.log('[gtfs-importer] Route dry-run', {
					action: existingRoute ? 'update' : 'create',
					code: routeInput.code,
					line_id: lineId,
				});
			}
		}

		const routeTrips = tripsByRoute.get(gtfsRoute.route_id) ?? [];
		const patternsByDirection = new Map<string, Map<string, { patternKey: string, stopTimes: typeof gtfsStopTimes, trip: typeof routeTrips[number] }>>();
		for (const trip of routeTrips) {
			const directionId = String(trip.direction_id ?? '0');
			const stopTimes = stopTimesByTrip.get(trip.trip_id) ?? [];
			if (!stopTimes.length) continue;
			const fingerprint = stopTimes.map(stopTime => stopTime.stop_id).join('|');
			const patternKey = resolvePatternKey(directionId, trip.pattern_id ?? null, fingerprint);
			if (!patternsByDirection.has(directionId)) patternsByDirection.set(directionId, new Map());
			if (!patternsByDirection.get(directionId)?.has(patternKey)) {
				patternsByDirection.get(directionId)?.set(patternKey, { patternKey, stopTimes, trip });
			}
		}
		const patternIdByKey = new Map<string, string>();

		for (const [directionId, patternGroup] of patternsByDirection.entries()) {
			const routeCode = truncate(`${lineCode}_${directionId}`, 10);
			const routeDoc = routeDocsByCode.get(routeCode);
			if (!routeDoc) {
				console.log('[gtfs-importer] Missing route for patterns', { line_id: lineId, routeCode });
				continue;
			}

			let patternIndex = 0;
			for (const [, { patternKey, stopTimes, trip }] of patternGroup.entries()) {
				const formattedPath: CreatePatternDto['path'] = [];
				const parametersPath: { avg_speed: number, dwell_time: number, stop_id: string }[] = [];
				const pathMetrics: Array<{ arrivalSec: null | number, departureSec: null | number, distanceDelta: number, stopRefId: string }> = [];
				let prevDistance: null | number = null;
				for (const [stopIndex, stopTime] of stopTimes.entries()) {
					const stopId = stopTime.stop_id.trim();
					const stopRef = await getStopByLegacyId(stopId, stopCache);
					if (!stopRef) {
						console.log('[gtfs-importer] Missing stop for pattern', {
							stop_id: stopId,
							trip_id: trip.trip_id,
						});
						continue;
					}

					const currentDistance = normalizeGtfsDistance(stopTime.shape_dist_traveled);
					let distanceDelta = 0;
					if (stopIndex === 0) {
						if (currentDistance !== null) prevDistance = currentDistance;
					} else if (currentDistance !== null && prevDistance !== null) {
						distanceDelta = Math.round(Math.max(0, (currentDistance - prevDistance) * 1000));
						prevDistance = currentDistance;
					} else if (currentDistance !== null) {
						prevDistance = currentDistance;
					}

					const patternZoneKey = trip.pattern_id ? `${trip.pattern_id}:${stopId}` : null;
					const zoneCodes = (patternZoneKey ? zonesByPatternStop.get(patternZoneKey) : undefined) ?? zonesByStop.get(stopId) ?? [];
					const zoneIds = zoneCodes.flatMap((code) => {
						const zoneId = zoneIdByCode.get(code);
						if (!zoneId) missingZoneCodes.add(code);
						return zoneId ? [zoneId] : [];
					});
					const zones = [...new Set(zoneIds)];
					const arrivalSec = normalizeGtfsTimeToSeconds(stopTime.arrival_time);
					const departureSec = normalizeGtfsTimeToSeconds(stopTime.departure_time);

					formattedPath.push({
						_id: `${stopRef._id}-${stopIndex}`,
						allow_drop_off: stopTime.drop_off_type === 0,
						allow_pickup: stopTime.pickup_type === 0,
						distance_delta: distanceDelta,
						stop_id: stopRef._id,
						timepoint: stopTime.timepoint === 1,
						zones,
					});

					pathMetrics.push({
						arrivalSec,
						departureSec,
						distanceDelta,
						stopRefId: stopRef._id,
					});
				}

				for (let i = 0; i < pathMetrics.length; i += 1) {
					const current = pathMetrics[i];
					const previous = pathMetrics[i - 1];
					const dwellTime = current.arrivalSec !== null && current.departureSec !== null
						? Math.max(0, current.departureSec - current.arrivalSec)
						: 0;
					let avgSpeed = 0;
					if (i > 0 && previous?.departureSec !== null && current.arrivalSec !== null) {
						const travelTime = current.arrivalSec - previous.departureSec;
						const segmentDistance = current.distanceDelta;
						if (travelTime > 0 && segmentDistance > 0) {
							avgSpeed = Math.round((segmentDistance * 3.6) / travelTime);
						}
					}

					parametersPath.push({
						avg_speed: avgSpeed,
						dwell_time: dwellTime,
						stop_id: current.stopRefId,
					});
				}

				const originStop = stopTimes[0];
				const destinationStop = stopTimes[stopTimes.length - 1];
				const origin = originStop ? (stopCache.get(originStop.stop_id)?.name ?? originStop.stop_id) : (trip.trip_headsign ?? 'Origem');
				const destination = destinationStop ? (stopCache.get(destinationStop.stop_id)?.name ?? destinationStop.stop_id) : (trip.trip_headsign ?? 'Destino');

				const patternCode = resolvePatternCode(lineCode, directionId, trip.pattern_id ?? null, patternIndex);
				const patternInput: CreatePatternDto = {
					code: patternCode,
					comments: [],
					created_by: 'system',
					destination,
					direction: directionId === '1' ? '1' : '0',
					headsign: trip.trip_headsign ?? destination,
					is_locked: false,
					line_id: lineId,
					origin,
					parameters: [{
						kind: 'default',
						path: parametersPath,
					}],
					path: formattedPath,
					route_id: routeDoc._id,
					rules: [],
				};

				const existingPattern = await patterns.findOne({ code: patternInput.code, line_id: lineId, route_id: routeDoc._id });
				if (!options.dryRun) {
					if (existingPattern) {
						await patterns.updateById(existingPattern._id, patternInput, { forceIfLocked: true });
						patternsUpdated += 1;
						patternIdByKey.set(patternKey, existingPattern._id);
						console.log('[gtfs-importer] Pattern updated', {
							code: patternInput.code,
							pattern_id: existingPattern._id,
						});
					} else {
						const patternDoc = await patterns.insertOne(patternInput);
						patternsCreated += 1;
						patternIdByKey.set(patternKey, patternDoc._id);
						console.log('[gtfs-importer] Pattern created', {
							code: patternInput.code,
							pattern_id: patternDoc._id,
						});
					}
				} else {
					const patternId = existingPattern?._id ?? `dry-${patternInput.code}`;
					patternIdByKey.set(patternKey, patternId);
					console.log('[gtfs-importer] Pattern dry-run', {
						action: existingPattern ? 'update' : 'create',
						code: patternInput.code,
						pattern_id: patternId,
					});
				}

				patternIndex += 1;
			}
		}

		const departuresByPattern = new Map<string, Map<string, Set<string>>>();
		for (const trip of routeTrips) {
			const directionId = String(trip.direction_id ?? '0');
			const stopTimes = stopTimesByTrip.get(trip.trip_id) ?? [];
			if (!stopTimes.length) continue;
			const fingerprint = stopTimes.map(stopTime => stopTime.stop_id).join('|');
			const patternKey = resolvePatternKey(directionId, trip.pattern_id ?? null, fingerprint);
			const patternId = patternIdByKey.get(patternKey);
			if (!patternId) {
				console.log('[gtfs-importer] Missing pattern for schedule', {
					direction_id: directionId,
					pattern_id: trip.pattern_id ?? null,
					trip_id: trip.trip_id,
				});
				continue;
			}
			const startTime = normalizeGtfsTimeToHHMM(stopTimes[0]?.departure_time);
			if (!startTime) {
				console.log('[gtfs-importer] Invalid departure time', {
					time: stopTimes[0]?.departure_time,
					trip_id: trip.trip_id,
				});
				continue;
			}
			if (!departuresByPattern.has(patternId)) departuresByPattern.set(patternId, new Map());
			if (!departuresByPattern.get(patternId)?.has(startTime)) departuresByPattern.get(patternId)?.set(startTime, new Set());
			departuresByPattern.get(patternId)?.get(startTime)?.add(trip.service_id);
		}

		const unknownServiceIds = new Set<string>();
		for (const [patternId, timeMap] of departuresByPattern.entries()) {
			const ruleMap = new Map<string, ManualRule>();
			for (const [time, serviceIds] of timeMap.entries()) {
				const weekdayMap = new Map<string, { weekdays: ManualRule['weekdays'], yearPeriodIds: string[] }>();
				for (const serviceId of serviceIds) {
					const calendarRules = CalendarRulesCM.get(serviceId);
					if (!calendarRules?.length) {
						unknownServiceIds.add(serviceId);
						continue;
					}
					for (const calendarRule of calendarRules) {
						const weekdayKey = [...new Set(calendarRule.weekdays)].sort((a, b) => a - b).join(',');
						const existingWeek = weekdayMap.get(weekdayKey);
						if (existingWeek) {
							existingWeek.yearPeriodIds = [...new Set([...existingWeek.yearPeriodIds, ...calendarRule.yearPeriodIds])].sort();
							weekdayMap.set(weekdayKey, existingWeek);
						} else {
							weekdayMap.set(weekdayKey, {
								weekdays: [...new Set(calendarRule.weekdays)].sort((a, b) => a - b),
								yearPeriodIds: [...new Set(calendarRule.yearPeriodIds)].sort(),
							});
						}
					}
				}

				for (const ruleEntry of weekdayMap.values()) {
					const periodKey = ruleEntry.yearPeriodIds.join(',');
					const weekdayKey = ruleEntry.weekdays.join(',');
					const ruleKey = `${weekdayKey}|${periodKey}`;
					const existingRule = ruleMap.get(ruleKey);
					if (existingRule) {
						existingRule.timePoints = [...new Set([...(existingRule.timePoints ?? []), time])].sort() as HHMM[];
						ruleMap.set(ruleKey, existingRule);
					} else {
						ruleMap.set(ruleKey, {
							_id: `${patternId}-${ruleKey}`,
							kind: 'manual',
							operatingMode: OPERATING_MODE.INCLUDE,
							timePoints: [time] as HHMM[],
							weekdays: ruleEntry.weekdays,
							yearPeriodIds: ruleEntry.yearPeriodIds,
						});
					}
				}
			}

			const mergedRules = [...ruleMap.values()];
			if (!mergedRules.length) continue;
			if (!options.dryRun) {
				await patterns.updateById(patternId, { rules: mergedRules }, { forceIfLocked: true });
				console.log('[gtfs-importer] Pattern rules updated', {
					pattern_id: patternId,
					rules: mergedRules.length,
				});
			} else {
				console.log('[gtfs-importer] Pattern rules dry-run', {
					pattern_id: patternId,
					rules: mergedRules.length,
					rules_json: JSON.stringify(mergedRules),
				});
			}
		}

		if (unknownServiceIds.size) {
			console.log('[gtfs-importer] Unmapped service_ids', {
				route_id: gtfsRoute.route_id,
				service_ids: [...unknownServiceIds],
			});
		}
	}

	if (missingZoneCodes.size) {
		console.log('[gtfs-importer] Unmapped zone codes', {
			codes: [...missingZoneCodes],
			count: missingZoneCodes.size,
		});
	}

	console.log('[gtfs-importer] Import finished', {
		linesCreated,
		linesUpdated,
		patternsCreated,
		patternsUpdated,
		routesCreated,
		routesUpdated,
	});

	return { linesCreated, linesUpdated, patternsCreated, patternsUpdated, routesCreated, routesUpdated };
}
