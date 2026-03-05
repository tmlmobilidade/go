import type { Event, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { calendarKey, CalendarKey, datesFromCalendarKey } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';

import { computeActiveRules } from '../calculation/index.js';
import { DayRuleDetail, DayScheduleDetail } from './types.js';

function buildDayScheduleDetail(
	key: CalendarKey,
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	events?: Event[],
): DayScheduleDetail {
	const date = datesFromCalendarKey(key);
	const { appliedRuleIds, timepoints: finalTimePoints } = computeActiveRules(date.operational_date, allRules, periods, { events });

	const appliedRules = appliedRuleIds
		.map(id => allRules.find(r => r._id === id))
		.filter((r): r is ScheduleRule => !!r);

	const includeRules: DayRuleDetail[] = [];
	const excludeRules: DayRuleDetail[] = [];
	const replacementRules: DayRuleDetail[] = [];
	const excludedTimePoints = new Map<string, ScheduleRule>();

	// Collect all timepoints from include rules (before exclusions)
	const allIncludeTimePoints = new Set<string>();

	for (const rule of appliedRules) {
		const isReplacement = rule.kind === 'event_replacement';
		const isExclude = (rule.kind === 'manual' && rule.operating_mode === 'exclude') || rule.kind === 'event_restriction';

		const detail: DayRuleDetail = {
			allTimePoints: rule.timepoints || [],
			rule,
			type: isReplacement ? 'replacement' : isExclude ? 'exclude' : 'include',
		};

		if (isReplacement) {
			replacementRules.push(detail);
		} else if (isExclude) {
			excludeRules.push(detail);

			// For manual exclude rules, add their timepoints to excludedTimePoints
			if (rule.kind === 'manual' && rule.operating_mode === 'exclude') {
				for (const tp of rule?.timepoints ?? []) {
					excludedTimePoints.set(tp, rule);
				}
			}
		} else {
			includeRules.push(detail);
			// Collect all include timepoints for later comparison
			for (const tp of rule.timepoints || []) {
				allIncludeTimePoints.add(tp);
			}
		}
	}

	// For event restrictions, find which timepoints were actually removed
	const finalTimePointsSet = new Set(finalTimePoints);
	for (const rule of excludeRules) {
		if (rule.rule.kind === 'event_restriction') {
			const restriction = rule.rule;

			// Find timepoints that were in includes but not in final (i.e., were removed)
			for (const tp of allIncludeTimePoints) {
				if (!finalTimePointsSet.has(tp)) {
					// This timepoint was removed - check if it's due to this restriction
					if (restriction.all_day) {
						// All day restriction removes everything
						excludedTimePoints.set(tp, rule.rule);
					} else if (restriction.start_time && restriction.end_time) {
						// Check if timepoint falls within the restriction window
						if (isTimeInRange(tp, restriction.start_time, restriction.end_time)) {
							excludedTimePoints.set(tp, rule.rule);
						}
					}
				}
			}
		}
	}

	return {
		excludedTimePoints,
		excludeRules,
		finalTimePoints,
		includeRules,
		replacementRules,
	};
}

/**
 * Helper to check if a time falls within a range (inclusive start, exclusive end)
 */
function isTimeInRange(time: string, start: string, end: string): boolean {
	// Convert HH:mm to minutes for comparison
	const timeToMinutes = (t: string): number => {
		const [h, m] = t.split(':').map(Number);
		return h * 60 + m;
	};

	const timeMinutes = timeToMinutes(time);
	const startMinutes = timeToMinutes(start);
	const endMinutes = timeToMinutes(end);

	return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

// USED IN PreviewCalendarView

/**
 * Build schedule details for all affected days in a date range.
 * Only includes days that have active timepoints or applied rules.
 */
export function buildAffectedDaysDetails(
	startDate: Dates,
	endDate: Dates,
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	options?: {
		events?: Event[]
	},
): Map<CalendarKey, DayScheduleDetail> {
	const affectedDays = new Map<CalendarKey, DayScheduleDetail>();

	let currentDate = startDate.startOf('day');

	while (currentDate.unix_timestamp <= endDate.unix_timestamp) {
		const key = calendarKey(currentDate);
		const dayDetails = buildDayScheduleDetail(key, allRules, periods, options?.events);

		// Only include days that are "affected" (have active timepoints or applied rules)
		if (
			dayDetails.finalTimePoints.length > 0
			|| dayDetails.includeRules.length > 0
			|| dayDetails.excludeRules.length > 0
			|| dayDetails.replacementRules.length > 0
		) {
			affectedDays.set(key, dayDetails);
		}

		currentDate = currentDate.plus({ days: 1 });
	}

	return affectedDays;
}
