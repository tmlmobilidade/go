/* * */

import { CalendarRule } from '@/types.js';
import { generateRandomString } from '@tmlmobilidade/strings';
import {
	GtfsTMLStopTimes,
	GtfsTMLTrip,
	HHMM,
	type ManualRule,
	PatternDirection,
	patternDirectionMapper,
} from '@tmlmobilidade/types';

import { CalendarRulesCM } from '../config/cm/calendarRules.js';
import { normalizeGtfsTimeToHHMM, resolvePatternKey } from '../helpers/index.js';

/* * */

/**
 * Build schedule rules keyed by patternKey (pure computation, no DB writes).
 * The returned map can be merged into pattern DTOs before insertion.
 *
 * Supported combinations:
 * - { weekdays, year_period_ids }
 * - { event_id }
 * - { event_id, weekdays }
 * - { event_id, year_period_ids }
 * - { event_id, weekdays, year_period_ids }
 *
 * Missing weekdays / year_period_ids are imported as empty arrays.
 */
export function buildScheduleRulesForRoute(params: {
	events: Array<{ _id: string }>
	routeId: string
	routeTrips: GtfsTMLTrip[]
	stopTimesByTrip: Map<string, GtfsTMLStopTimes[]>
}): { rulesByPatternKey: Map<string, ManualRule[]>, unknownServiceIds: Set<string> } {
	const { events, routeId, routeTrips, stopTimesByTrip } = params;

	const departuresByPatternKey = new Map<string, Map<string, Set<string>>>();
	const validEventIds = new Set(events.map(event => event._id));

	for (const trip of routeTrips) {
		const directionId = patternDirectionMapper.fromGtfs(trip.direction_id ?? '0') as PatternDirection;
		const stopTimes = stopTimesByTrip.get(trip.trip_id) ?? [];

		if (!stopTimes.length) continue;

		const fingerprint = stopTimes.map(stopTime => stopTime.stop_id).join('|');
		const patternKey = resolvePatternKey(directionId, trip.pattern_id ?? null, fingerprint);
		const startTime = normalizeGtfsTimeToHHMM(stopTimes[0]?.departure_time);

		if (!startTime) {
			warn(WARNING.INVALID_DEPARTURE_TIME, {
				time: stopTimes[0]?.departure_time,
				trip_id: trip.trip_id,
			});
			continue;
		}

		if (!departuresByPatternKey.has(patternKey)) {
			departuresByPatternKey.set(patternKey, new Map());
		}

		if (!departuresByPatternKey.get(patternKey)?.has(startTime)) {
			departuresByPatternKey.get(patternKey)?.set(startTime, new Set());
		}

		departuresByPatternKey.get(patternKey)?.get(startTime)?.add(trip.service_id);
	}

	if (!departuresByPatternKey.size) {
		warn(WARNING.NO_SCHEDULE_RULES_ROUTE, {
			route_id: routeId,
			trips: routeTrips.length,
		});
	}

	const unknownServiceIds = new Set<string>();
	const rulesByPatternKey = new Map<string, ManualRule[]>();

	for (const [patternKey, timeMap] of departuresByPatternKey.entries()) {
		const ruleMap = new Map<string, ManualRule>();

		for (const [time, serviceIds] of timeMap.entries()) {
			/**
			 * For a single timepoint, first group calendar rules by:
			 * - event_id
			 * - weekdays
			 *
			 * and union the year periods.
			 *
			 * This preserves the old behaviour where:
			 * - VER + [1,2,3]
			 * - FER + [1,2,3]
			 *
			 * becomes:
			 * - [VER, FER] + [1,2,3]
			 *
			 * but keeps event rules separate from non-event rules, and
			 * different event_ids separate from each other.
			 */
			const includeGroupedByEventAndWeekdays = new Map<string, NormalizedRuleDimensions>();
			const excludeGroupedByEventAndWeekdays = new Map<string, NormalizedRuleDimensions>();

			for (const serviceId of serviceIds) {
				const calendarRules = CalendarRulesCM.get(serviceId) as CalendarRule[] | undefined;

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
			warn(WARNING.NO_SCHEDULE_RULES_PATTERN, {
				pattern_key: patternKey,
				route_id: routeId,
			});
		}
	}

	return { rulesByPatternKey, unknownServiceIds };
}
