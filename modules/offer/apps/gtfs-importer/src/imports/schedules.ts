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
import { warn, WARNING } from '../warnings.js';

/* * */

interface NormalizedRuleDimensions {
	event_id?: string
	months: ManualRule['months']
	weekdays: ManualRule['weekdays']
	year_period_ids: string[]
}

function sortAndUniqMonths(months: number[] = []): ManualRule['months'] {
	return [...new Set(months)].sort((a, b) => a - b) as ManualRule['months'];
}

function sortAndUniqWeekdays(weekdays: number[] = []): ManualRule['weekdays'] {
	return [...new Set(weekdays)].sort((a, b) => a - b) as ManualRule['weekdays'];
}

function sortAndUniqStrings(values: string[] = []): string[] {
	return [...new Set(values)].sort();
}

function sortAndUniqTimepoints(values: HHMM[] = []): HHMM[] {
	return [...new Set(values)].sort() as HHMM[];
}

/**
 * Merge rules with same event_id + same year_period_ids + same timepoints,
 * combining weekdays.
 */
function mergeRulesByPeriodsAndTimes(rules: ManualRule[]): ManualRule[] {
	const merged = new Map<string, ManualRule>();

	for (const rule of rules) {
		const operatingModeKey = rule.operating_mode;
		const eventKey = rule.event_id ?? '';
		const periodKey = sortAndUniqStrings(rule.year_period_ids ?? []).join(',');
		const monthsKey = sortAndUniqMonths(rule.months ?? [])?.join(',') ?? '';
		const timesKey = sortAndUniqTimepoints(rule.timepoints ?? []).join(',');
		const mergeKey = `${operatingModeKey}|${eventKey}|${periodKey}|${monthsKey}|${timesKey}`;

		const existing = merged.get(mergeKey);

		if (existing) {
			existing.weekdays = sortAndUniqWeekdays([
				...(existing.weekdays ?? []),
				...(rule.weekdays ?? []),
			]);

			merged.set(mergeKey, existing);
		} else {
			merged.set(mergeKey, {
				...rule,
				...(rule.months?.length && { months: sortAndUniqMonths(rule.months) }),
				timepoints: sortAndUniqTimepoints(rule.timepoints ?? []),
				weekdays: sortAndUniqWeekdays(rule.weekdays ?? []),
				year_period_ids: sortAndUniqStrings(rule.year_period_ids ?? []),
			});
		}
	}

	return [...merged.values()];
}

/**
 * Merge rules with same event_id + same weekdays + same timepoints,
 * combining year_period_ids.
 */
function mergeRulesByWeekdaysAndTimes(rules: ManualRule[]): ManualRule[] {
	const merged = new Map<string, ManualRule>();

	for (const rule of rules) {
		const operatingModeKey = rule.operating_mode;
		const eventKey = rule.event_id ?? '';
		const weekdayKey = sortAndUniqWeekdays(rule.weekdays ?? []).join(',');
		const monthsKey = sortAndUniqMonths(rule.months ?? [])?.join(',') ?? '';
		const timesKey = sortAndUniqTimepoints(rule.timepoints ?? []).join(',');
		const mergeKey = `${operatingModeKey}|${eventKey}|${weekdayKey}|${monthsKey}|${timesKey}`;

		const existing = merged.get(mergeKey);

		if (existing) {
			existing.year_period_ids = sortAndUniqStrings([
				...(existing.year_period_ids ?? []),
				...(rule.year_period_ids ?? []),
			]);

			merged.set(mergeKey, existing);
		} else {
			merged.set(mergeKey, {
				...rule,
				...(rule.months?.length && { months: sortAndUniqMonths(rule.months) }),
				timepoints: sortAndUniqTimepoints(rule.timepoints ?? []),
				weekdays: sortAndUniqWeekdays(rule.weekdays ?? []),
				year_period_ids: sortAndUniqStrings(rule.year_period_ids ?? []),
			});
		}
	}

	return [...merged.values()];
}

/**
 * Re-apply the two symmetric merges until the result stabilizes.
 * This lets cases like:
 *
 * - VER + [1,2,3] + 08:00
 * - VER + [5,6]   + 08:00
 * - FER + [1,2,3,5,6] + 08:00
 *
 * converge into:
 *
 * - [FER, VER] + [1,2,3,5,6] + 08:00
 */
function mergeRulesUntilStable(rules: ManualRule[]): ManualRule[] {
	let current: ManualRule[] = rules.map(rule => ({
		...rule,
		...(rule.months?.length && { months: sortAndUniqMonths(rule.months) }),
		timepoints: sortAndUniqTimepoints(rule.timepoints ?? []),
		weekdays: sortAndUniqWeekdays(rule.weekdays ?? []),
		year_period_ids: sortAndUniqStrings(rule.year_period_ids ?? []),
	}));

	while (true) {
		const beforeKeys = current
			.map(rule => [
				rule.operating_mode,
				rule.event_id ?? '',
				(rule.weekdays ?? []).join(','),
				(rule.months ?? []).join(','),
				(rule.year_period_ids ?? []).join(','),
				(rule.timepoints ?? []).join(','),
			].join('|'))
			.sort()
			.join('||');

		current = mergeRulesByPeriodsAndTimes(current);
		current = mergeRulesByWeekdaysAndTimes(current);

		const afterKeys = current
			.map(rule => [
				rule.operating_mode,
				rule.event_id ?? '',
				(rule.weekdays ?? []).join(','),
				(rule.months ?? []).join(','),
				(rule.year_period_ids ?? []).join(','),
				(rule.timepoints ?? []).join(','),
			].join('|'))
			.sort()
			.join('||');

		if (beforeKeys === afterKeys) {
			return current;
		}
	}
}

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
					const eventId = calendarRule.event_id;
					const months = sortAndUniqMonths(calendarRule.months ?? []);
					const weekdays = sortAndUniqWeekdays(calendarRule.weekdays ?? []);
					const yearPeriodIds = sortAndUniqStrings(calendarRule.year_period_ids ?? []);

					if (eventId && !validEventIds.has(eventId)) {
						warn(WARNING.UNKNOWN_EVENT, {
							event_id: eventId,
							pattern_key: patternKey,
							route_id: routeId,
							service_id: serviceId,
						});
						continue;
					}

					const groupingKey = [
						`event:${eventId ?? ''}`,
						`months:${months?.join(',') ?? ''}`,
						`weekdays:${weekdays.join(',')}`,
					].join('|');

					const targetGrouped = calendarRule.isExclude
						? excludeGroupedByEventAndWeekdays
						: includeGroupedByEventAndWeekdays;

					const existing = targetGrouped.get(groupingKey);

					if (existing) {
						existing.year_period_ids = sortAndUniqStrings([
							...existing.year_period_ids,
							...yearPeriodIds,
						]);

						targetGrouped.set(groupingKey, existing);
					} else {
						targetGrouped.set(groupingKey, {
							event_id: eventId,
							months,
							weekdays,
							year_period_ids: yearPeriodIds,
						});
					}
				}
			}

			/**
			 * Then group across timepoints by:
			 * - operating_mode
			 * - event_id
			 * - weekdays
			 * - year_period_ids
			 *
			 * and union timepoints.
			 */
			for (const [operatingMode, groupedMap] of [
				['include', includeGroupedByEventAndWeekdays],
				['exclude', excludeGroupedByEventAndWeekdays],
			] as const) {
				for (const ruleEntry of groupedMap.values()) {
					const eventKey = ruleEntry.event_id ?? '';
					const weekdayKey = ruleEntry.weekdays.join(',');
					const monthsKey = ruleEntry.months?.join(',') ?? '';
					const periodKey = ruleEntry.year_period_ids.join(',');
					const ruleKey = `${operatingMode}|${eventKey}|${weekdayKey}|${monthsKey}|${periodKey}`;

					const existingRule = ruleMap.get(ruleKey);

					if (existingRule) {
						existingRule.timepoints = sortAndUniqTimepoints([
							...(existingRule.timepoints ?? []),
							time as HHMM,
						]);

						ruleMap.set(ruleKey, existingRule);
					} else {
						ruleMap.set(ruleKey, {
							_id: generateRandomString({ length: 5 }),
							...(ruleEntry.event_id && { event_id: ruleEntry.event_id }),
							...(ruleEntry.months?.length && { months: ruleEntry.months }),
							kind: 'manual',
							operating_mode: operatingMode,
							timepoints: [time as HHMM],
							weekdays: ruleEntry.weekdays,
							year_period_ids: ruleEntry.year_period_ids,
						});
					}
				}
			}
		}

		/**
		 * Final normalization/merge passes:
		 *
		 * 1. same event_id + same periods + same times   => combine weekdays
		 * 2. same event_id + same weekdays + same times  => combine periods
		 *
		 * Repeated until stable so chained merges are also resolved.
		 */
		const finalRules = mergeRulesUntilStable([...ruleMap.values()]);

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
