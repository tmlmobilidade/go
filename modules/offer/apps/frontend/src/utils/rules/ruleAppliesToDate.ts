import type { EventDerivedRestriction, ManualScheduleRule, OperationalDate, Period, ScheduleRule } from '@tmlmobilidade/types';

import { calendarKey, CalendarKey, calendarWeekday, Dates, datesFromCalendarKey, keyToYYYYMMDD } from '@tmlmobilidade/dates';

interface CalendarContext {
	endDate: Date
	periods: Period[]
	startDate: Date
}

/* ---------------- type guards ---------------- */

const isManualRule = (r: ScheduleRule): r is ManualScheduleRule => r.kind === 'manual';
const isEventRule = (r: ScheduleRule): r is EventDerivedRestriction => r.kind === 'event';

/* ---------------- helpers ---------------- */

function isInPeriod(rule: ManualScheduleRule, key: CalendarKey, ctx: CalendarContext): boolean {
	if (!rule.periodIds?.length) return false;

	const op = keyToYYYYMMDD(key) as OperationalDate;
	return ctx.periods.some(p => rule.periodIds?.includes(p._id) && p.dates?.includes(op));
}

function ruleAppliesToCivilKey(rule: ManualScheduleRule, key: CalendarKey, ctx: CalendarContext): boolean {
	const weekday = calendarWeekday(key);

	// 1) Period required
	if (!isInPeriod(rule, key, ctx)) return false;

	// 2) Weekdays required
	if (!rule.weekdays?.length) return false;
	if (!rule.weekdays.includes(weekday)) return false;

	return true;
}

export function computeRuleImpact(rule: ManualScheduleRule, ctx: CalendarContext) {
	const affected: CalendarKey[] = [];

	const startKey = calendarKey(Dates.fromJSDate(ctx.startDate));
	const endKey = calendarKey(Dates.fromJSDate(ctx.endDate));

	const from = startKey < endKey ? startKey : endKey;
	const to = startKey < endKey ? endKey : startKey;

	let current = datesFromCalendarKey(from);
	const end = datesFromCalendarKey(to);

	while (current.unix_timestamp <= end.unix_timestamp) {
		const key = calendarKey(current);

		if (ruleAppliesToCivilKey(rule, key, ctx)) {
			affected.push(key);
		}

		current = current.plus({ days: 1 });
	}

	return { count: affected.length, dates: affected };
}

/* ---------------- output ---------------- */

export interface RulesPreview {
	byDate: Map<CalendarKey, Set<string>>
	dates: CalendarKey[]
}

/* ---------------- main ---------------- */

export function computeFinalAffectedDatesAndTimepoints(
	rules: ScheduleRule[],
	ctx: CalendarContext,
): RulesPreview {
	const byDate = new Map<CalendarKey, Set<string>>();

	const ensure = (k: CalendarKey) => {
		let s = byDate.get(k);
		if (!s) {
			s = new Set<string>();
			byDate.set(k, s);
		}
		return s;
	};

	// 1) Apply MANUAL rules (include/exclude timePoints)
	for (const r of rules) {
		if (!isManualRule(r)) continue;

		const impacted = computeRuleImpact(r, ctx).dates;
		const tps = (r.timePoints ?? []) as string[];

		if (r.operatingMode === 'exclude') {
			for (const k of impacted) {
				if (tps.length === 0) {
					byDate.delete(k);
					continue;
				}

				const set = byDate.get(k);
				if (!set) continue;

				for (const tp of tps) set.delete(tp);
				if (set.size === 0) byDate.delete(k);
			}
		}
		else {
			for (const k of impacted) {
				const set = ensure(k);
				for (const tp of tps) set.add(tp);
			}
		}
	}

	// 2) Apply EVENT-derived restrictions (remove within window on explicit dates)
	for (const r of rules) {
		if (!isEventRule(r)) continue;

		const start = r.event?.start_time;
		const end = r.event?.end_time;
		if (!start || !end) continue;

		// build a Set for O(1) date membership checks
		const opDates = new Set<OperationalDate>(r.dates as OperationalDate[]);

		// Check if the event crosses midnight (e.g., 10:00 to 02:00)
		const crossesMidnight = end < start;

		// Only iterate included days (cheap)
		for (const [k, set] of byDate) {
			const op = keyToYYYYMMDD(k) as OperationalDate;
			if (!opDates.has(op)) continue;

			for (const tp of Array.from(set)) {
				const isAffected = crossesMidnight
					? (tp >= start || tp <= end) // Overnight: after start OR before end
					: (tp >= start && tp <= end); // Same day: between start and end

				if (isAffected) set.delete(tp);
			}

			if (set.size === 0) byDate.delete(k);
		}
	}

	const dates = Array.from(byDate.keys()).sort();
	return { byDate, dates };
}
