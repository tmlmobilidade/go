'use client';

/* *
 * Organized-by-dates utilities for SamAnalysis
 * Responsible for mapping SamAnalysis to day/month granularity.
 */

import { type SamAnalysis } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';

import { analysisSquareHasValues } from './AnalysisSquare/analysis-square-shared';

/**
 * Special key for analyses with no dates (start_time/end_time both null).
 */
export const SEM_DATA_KEY = 'Sem data';

/** All calendar calculations assume this timezone. */
const TZ = 'Europe/Lisbon';

/**
 * Accents. Green: all with values, Orange: mixed, Red: all empty, White: empty placeholder.
 */
export type DayAccent = 'green' | 'orange' | 'red' | 'white';

/**
 * Represents a section of days or months for displaying in the UI.
 */
export interface DaySection {
	accent: DayAccent
	dayKey: string
	items: SamAnalysis[]
	label: string
}

/**
 * Optionally restrict analysis to a date range (ms-epoch).
 */
export interface SectionsRangeOptions {
	rangeEndTs?: null | number
	rangeStartTs?: null | number
}

/**
 * Returns month key "yyyy-LL" for an ISO dayKey, or null if invalid.
 */
const monthKeyFromDayKey = (dayKey: string): null | string => {
	// dayKey is ISO date (YYYY-MM-DD)
	const dt = DateTime.fromISO(dayKey, { zone: TZ });
	if (!dt.isValid) return null;
	return dt.toFormat('yyyy-LL');
};

/**
 * Returns all day keys (ISO) an analysis covers.
 * - If both start_time/end_time exist: every day in the closed range.
 * - Otherwise, single day (or undated).
 */
const dayKeysForAnalysis = (a: SamAnalysis): string[] => {
	const startTs = a.start_time;
	const endTs = a.end_time;

	// No time data: group under SEM_DATA_KEY
	if (startTs == null && endTs == null) {
		return [SEM_DATA_KEY];
	}

	// Both start and end exist: enumerate days in range (inclusive)
	if (startTs != null && endTs != null) {
		const startDay = DateTime.fromMillis(startTs).setZone(TZ).startOf('day');
		const endDay = DateTime.fromMillis(endTs).setZone(TZ).startOf('day');
		if (!startDay.isValid || !endDay.isValid) return [SEM_DATA_KEY];

		const from = startDay <= endDay ? startDay : endDay;
		const to = startDay <= endDay ? endDay : startDay;
		const keys: string[] = [];
		let cursor = from;
		while (cursor <= to) {
			const iso = cursor.toISODate();
			if (iso) keys.push(iso);
			cursor = cursor.plus({ days: 1 });
		}
		return keys.length > 0 ? keys : [SEM_DATA_KEY];
	}

	// Only one timestamp: treat as single date
	const ts = startTs ?? endTs;
	const day = DateTime.fromMillis(ts).setZone(TZ).toISODate();
	return day ? [day] : [SEM_DATA_KEY];
};

/**
 * Accent color for a section, based on contained analyses.
 *   green: all with values;
 *   orange: at least one with value, and at least one empty;
 *   red: all empty;
 *   white: empty section.
 */
const accentForDay = (items: SamAnalysis[]): DayAccent => {
	if (items.length === 0) return 'white';
	let withVal = 0;
	let without = 0;
	for (const a of items) {
		if (analysisSquareHasValues(a)) withVal++;
		else without++;
	}
	if (withVal > 0 && without === 0) return 'green';
	if (withVal > 0 && without > 0) return 'orange';
	return 'red';
};

/**
 * Returns a DateTime object for a timestamp at the start of the day (in TZ).
 */
const dayFromTs = (ts: number) => DateTime.fromMillis(ts).setZone(TZ).startOf('day');

/**
 * Determines explicit range bounds from options.
 * Returns {start, end} as DateTime objects (start ≤ end), or null if range invalid.
 */
const rangeBoundsFromOptions = ({ rangeEndTs, rangeStartTs }: SectionsRangeOptions) => {
	if (rangeStartTs == null || rangeEndTs == null) return null;
	const start = dayFromTs(rangeStartTs);
	const end = dayFromTs(rangeEndTs);
	if (!start.isValid || !end.isValid) return null;
	return start <= end ? { end, start } : { end: start, start: end };
};

/**
 * Organizes analyses as a list of DaySections, grouped by day.
 * If range provided, sections span the full day range (whether or not data exists for every day).
 * If no explicit range, sections fill from min→max day in data.
 * The final section (if any) is for undated analyses (SEM_DATA_KEY).
 */
export const buildSections = (
	analyses: SamAnalysis[],
	options: SectionsRangeOptions = {},
): DaySection[] => {
	const byDay = new Map<string, SamAnalysis[]>();
	// Map each analysis to all of its covered days
	for (const a of analyses) {
		for (const key of dayKeysForAnalysis(a)) {
			const list = byDay.get(key) ?? [];
			list.push(a);
			byDay.set(key, list);
		}
	}

	// Dates with actual values (excluding SEM_DATA_KEY)
	const datedKeys = [...byDay.keys()].filter(k => k !== SEM_DATA_KEY);
	const sections: DaySection[] = [];
	const explicitRange = rangeBoundsFromOptions(options);

	let firstDay: DateTime | null = explicitRange ? explicitRange.start : null;
	let lastDay: DateTime | null = explicitRange ? explicitRange.end : null;

	// If no explicit range: infer from min/max day in data
	if (explicitRange == null && datedKeys.length > 0) {
		const sorted = [...datedKeys].sort();
		const firstFromData = sorted[0] ? DateTime.fromISO(sorted[0], { zone: TZ }).startOf('day') : null;
		const lastFromData = sorted[sorted.length - 1] ? DateTime.fromISO(sorted[sorted.length - 1], { zone: TZ }).startOf('day') : null;
		if (firstFromData?.isValid && lastFromData?.isValid) {
			firstDay = firstFromData;
			lastDay = lastFromData;
		}
	}

	// Build one section per day in the full range
	if (firstDay != null && lastDay != null) {
		let cursor = firstDay;
		while (cursor <= lastDay) {
			const k = cursor.toISODate();
			if (k) {
				const items = byDay.get(k) ?? [];
				sections.push({
					accent: accentForDay(items),
					dayKey: k,
					items,
					label: cursor.toFormat('dd'),
				});
			}
			cursor = cursor.plus({ days: 1 });
		}
	}

	// Add SEM_DATA_KEY section (undated analyses) if present
	const undated = byDay.get(SEM_DATA_KEY);
	if (undated?.length) {
		sections.push({
			accent: accentForDay(undated),
			dayKey: SEM_DATA_KEY,
			items: undated,
			label: SEM_DATA_KEY,
		});
	}

	return sections;
};

/**
 * Organizes analyses as a list of DaySections, grouped by month.
 * If range provided, sections span every month between rangeStart and rangeEnd (even if no data).
 * If no explicit range, fills min→max month covered by data.
 * The final section (if any) is for undated analyses (SEM_DATA_KEY).
 */
export const buildMonthSections = (
	analyses: SamAnalysis[],
	options: SectionsRangeOptions = {},
): DaySection[] => {
	const byMonth = new Map<string, SamAnalysis[]>();

	for (const a of analyses) {
		const dayKeys = dayKeysForAnalysis(a);

		// Analyses with no relevant dates go to SEM_DATA_KEY group
		if (dayKeys.length === 1 && dayKeys[0] === SEM_DATA_KEY) {
			const list = byMonth.get(SEM_DATA_KEY) ?? [];
			list.push(a);
			byMonth.set(SEM_DATA_KEY, list);
			continue;
		}

		// Otherwise, assign to all months covered by analysis
		const months = new Set<string>();
		for (const dayKey of dayKeys) {
			if (dayKey === SEM_DATA_KEY) continue;
			const mk = monthKeyFromDayKey(dayKey);
			if (mk) months.add(mk);
		}
		// If couldn't assign any months, treat as undated
		if (months.size === 0) {
			const list = byMonth.get(SEM_DATA_KEY) ?? [];
			list.push(a);
			byMonth.set(SEM_DATA_KEY, list);
			continue;
		}
		// Add to all months spanned by this analysis
		for (const mk of months) {
			const list = byMonth.get(mk) ?? [];
			list.push(a);
			byMonth.set(mk, list);
		}
	}

	// List of month keys (yyyy-LL) except SEM_DATA_KEY
	const datedKeys = [...byMonth.keys()].filter(k => k !== SEM_DATA_KEY);
	const sections: DaySection[] = [];
	const explicitRange = rangeBoundsFromOptions(options);

	// Range bounds (months). If explicit, snap to start of month; if inferred, min/max from data
	let firstMonth = explicitRange?.start?.startOf('month') ?? null;
	let lastMonth = explicitRange?.end?.startOf('month') ?? null;

	if (explicitRange == null && datedKeys.length > 0) {
		const sorted = [...datedKeys].sort();
		const first = sorted[0]
			? DateTime.fromFormat(sorted[0], 'yyyy-LL', { zone: TZ }).startOf('month')
			: null;
		const last = sorted[sorted.length - 1]
			? DateTime.fromFormat(sorted[sorted.length - 1], 'yyyy-LL', { zone: TZ }).startOf('month')
			: null;
		if (first?.isValid && last?.isValid) {
			firstMonth = first;
			lastMonth = last;
		}
	}

	// One section per month in the range
	if (firstMonth != null && lastMonth != null) {
		let cursor = firstMonth;
		while (cursor <= lastMonth) {
			const k = cursor.toFormat('yyyy-LL');
			const items = byMonth.get(k) ?? [];
			const pt = cursor.setLocale('pt-PT');
			const monthShort = pt.toFormat('LLLL').slice(0, 3);
			const yearShort = pt.toFormat('yy');
			sections.push({
				accent: accentForDay(items),
				dayKey: k,
				items,
				label: `${monthShort} ${yearShort}`,
			});
			cursor = cursor.plus({ months: 1 });
		}
	}

	// Add SEM_DATA_KEY section (undated analyses) if present
	const undated = byMonth.get(SEM_DATA_KEY);
	if (undated?.length) {
		sections.push({
			accent: accentForDay(undated),
			dayKey: SEM_DATA_KEY,
			items: undated,
			label: SEM_DATA_KEY,
		});
	}

	return sections;
};
