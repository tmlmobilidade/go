/* * */

import { GtfsTMLStopTimes, GtfsTMLTrip, HHMM, type ManualRule, PatternDirection, patternDirectionMapper } from '@tmlmobilidade/types';

import { CalendarRulesCM } from '../config/cm/calendarRules.js';
import { normalizeGtfsTimeToHHMM, resolvePatternKey } from '../helpers/index.js';

/* * */

/**
 * Build schedule rules keyed by patternKey (pure computation, no DB writes).
 * The returned map can be merged into pattern DTOs before insertion.
 */
export function buildScheduleRulesForRoute(params: {
	routeId: string
	routeTrips: GtfsTMLTrip[]
	stopTimesByTrip: Map<string, GtfsTMLStopTimes[]>
}): { rulesByPatternKey: Map<string, ManualRule[]>, unknownServiceIds: Set<string> } {
	const { routeId, routeTrips, stopTimesByTrip } = params;
	const departuresByPatternKey = new Map<string, Map<string, Set<string>>>();

	for (const trip of routeTrips) {
		const directionId = patternDirectionMapper.fromGtfs(trip.direction_id ?? '0') as PatternDirection;
		const stopTimes = stopTimesByTrip.get(trip.trip_id) ?? [];
		if (!stopTimes.length) continue;
		const fingerprint = stopTimes.map(stopTime => stopTime.stop_id).join('|');
		const patternKey = resolvePatternKey(directionId, trip.pattern_id ?? null, fingerprint);
		const startTime = normalizeGtfsTimeToHHMM(stopTimes[0]?.departure_time, trip.pattern_id);
		if (!startTime) {
			console.log('[gtfs-importer] Invalid departure time', {
				time: stopTimes[0]?.departure_time,
				trip_id: trip.trip_id,
			});
			continue;
		}
		if (!departuresByPatternKey.has(patternKey)) departuresByPatternKey.set(patternKey, new Map());
		if (!departuresByPatternKey.get(patternKey)?.has(startTime)) departuresByPatternKey.get(patternKey)?.set(startTime, new Set());
		departuresByPatternKey.get(patternKey)?.get(startTime)?.add(trip.service_id);
	}

	if (!departuresByPatternKey.size) {
		console.log('[gtfs-importer] No schedule rules created for route', {
			route_id: routeId,
			trips: routeTrips.length,
		});
	}

	const unknownServiceIds = new Set<string>();
	const rulesByPatternKey = new Map<string, ManualRule[]>();

	for (const [patternKey, timeMap] of departuresByPatternKey.entries()) {
		const ruleMap = new Map<string, ManualRule>();
		for (const [time, serviceIds] of timeMap.entries()) {
			const weekdayMap = new Map<string, { weekdays: ManualRule['weekdays'], year_period_ids: string[] }>();
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
						existingWeek.year_period_ids = [...new Set([...existingWeek.year_period_ids, ...calendarRule.year_period_ids])].sort();
						weekdayMap.set(weekdayKey, existingWeek);
					} else {
						weekdayMap.set(weekdayKey, {
							weekdays: [...new Set(calendarRule.weekdays)].sort((a, b) => a - b),
							year_period_ids: [...new Set(calendarRule.year_period_ids)].sort(),
						});
					}
				}
			}

			for (const ruleEntry of weekdayMap.values()) {
				const periodKey = ruleEntry.year_period_ids.join(',');
				const weekdayKey = ruleEntry.weekdays.join(',');
				const ruleKey = `${weekdayKey}|${periodKey}`;
				const existingRule = ruleMap.get(ruleKey);
				if (existingRule) {
					existingRule.timepoints = [...new Set([...(existingRule.timepoints ?? []), time])].sort() as HHMM[];
					ruleMap.set(ruleKey, existingRule);
				} else {
					ruleMap.set(ruleKey, {
						_id: `${patternKey}-${ruleKey}`,
						kind: 'manual',
						operating_mode: 'include',
						timepoints: [time] as HHMM[],
						weekdays: ruleEntry.weekdays,
						year_period_ids: ruleEntry.year_period_ids,
					});
				}
			}
		}

		const mergedRules = [...ruleMap.values()];
		const mergedByPeriodAndTimes = new Map<string, ManualRule>();
		for (const rule of mergedRules) {
			const periodKey = rule.year_period_ids.join(',');
			const timesKey = (rule.timepoints ?? []).join(',');
			const mergeKey = `${periodKey}|${timesKey}`;
			const existing = mergedByPeriodAndTimes.get(mergeKey);
			if (existing) {
				existing.weekdays = [...new Set([...(existing.weekdays ?? []), ...(rule.weekdays ?? [])])].sort((a, b) => a - b);
				mergedByPeriodAndTimes.set(mergeKey, existing);
			} else {
				mergedByPeriodAndTimes.set(mergeKey, rule);
			}
		}
		const finalRules = [...mergedByPeriodAndTimes.values()];
		if (finalRules.length) {
			rulesByPatternKey.set(patternKey, finalRules);
		} else {
			console.log('[gtfs-importer] No schedule rules created for pattern', {
				pattern_key: patternKey,
				route_id: routeId,
			});
		}
	}

	return { rulesByPatternKey, unknownServiceIds };
}
