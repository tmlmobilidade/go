'use client';

/* * */

import { type SamAnalysis } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';

import { analysisSquareHasValues } from '../AnalysisSquare/analysis-square-shared';

/* * */

const SEM_DATA_KEY = 'Sem data';
const TZ = 'Europe/Lisbon';

type DayAccent = 'green' | 'orange' | 'red';

interface DaySection {
	accent: DayAccent
	dayKey: string
	items: SamAnalysis[]
	label: string
}

const monthKeyFromDayKey = (dayKey: string): null | string => {
	// dayKey is ISO date (YYYY-MM-DD)
	const dt = DateTime.fromISO(dayKey, { zone: TZ });
	if (!dt.isValid) return null;
	return dt.toFormat('yyyy-LL');
};

/**
 * All calendar days (Europe/Lisbon) an analysis belongs to.
 * When both `start_time` and `end_time` exist, every day in the inclusive range gets a copy (e.g. 9/12–11/12 → 3 days).
 */
const dayKeysForAnalysis = (a: SamAnalysis): string[] => {
	const startTs = a.start_time;
	const endTs = a.end_time;

	if (startTs == null && endTs == null) {
		return [SEM_DATA_KEY];
	}

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

	const ts = startTs ?? endTs;
	const day = DateTime.fromMillis(ts).setZone(TZ).toISODate();
	return day ? [day] : [SEM_DATA_KEY];
};

const accentForDay = (items: SamAnalysis[]): DayAccent => {
	if (items.length === 0) return 'red';
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

export const buildSections = (analyses: SamAnalysis[]): DaySection[] => {
	const byDay = new Map<string, SamAnalysis[]>();
	for (const a of analyses) {
		for (const key of dayKeysForAnalysis(a)) {
			const list = byDay.get(key) ?? [];
			list.push(a);
			byDay.set(key, list);
		}
	}

	const datedKeys = [...byDay.keys()].filter(k => k !== SEM_DATA_KEY);
	const sections: DaySection[] = [];

	if (datedKeys.length > 0) {
		const sorted = [...datedKeys].sort();
		const first = sorted[0];
		const last = sorted[sorted.length - 1];
		if (first !== undefined && last !== undefined) {
			let cursor = DateTime.fromISO(first, { zone: TZ }).startOf('day');
			const end = DateTime.fromISO(last, { zone: TZ }).startOf('day');
			while (cursor <= end) {
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
	}

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

export const buildMonthSections = (analyses: SamAnalysis[]): DaySection[] => {
	const byMonth = new Map<string, SamAnalysis[]>();

	for (const a of analyses) {
		const dayKeys = dayKeysForAnalysis(a);
		if (dayKeys.length === 1 && dayKeys[0] === SEM_DATA_KEY) {
			const list = byMonth.get(SEM_DATA_KEY) ?? [];
			list.push(a);
			byMonth.set(SEM_DATA_KEY, list);
			continue;
		}

		const months = new Set<string>();
		for (const dayKey of dayKeys) {
			if (dayKey === SEM_DATA_KEY) continue;
			const mk = monthKeyFromDayKey(dayKey);
			if (mk) months.add(mk);
		}
		if (months.size === 0) {
			const list = byMonth.get(SEM_DATA_KEY) ?? [];
			list.push(a);
			byMonth.set(SEM_DATA_KEY, list);
			continue;
		}
		for (const mk of months) {
			const list = byMonth.get(mk) ?? [];
			list.push(a);
			byMonth.set(mk, list);
		}
	}

	const datedKeys = [...byMonth.keys()].filter(k => k !== SEM_DATA_KEY);
	const sections: DaySection[] = [];

	if (datedKeys.length > 0) {
		const sorted = [...datedKeys].sort();
		const first = sorted[0];
		const last = sorted[sorted.length - 1];

		if (first !== undefined && last !== undefined) {
			let cursor = DateTime.fromFormat(first, 'yyyy-LL', { zone: TZ }).startOf('month');
			const end = DateTime.fromFormat(last, 'yyyy-LL', { zone: TZ }).startOf('month');

			while (cursor <= end) {
				const k = cursor.toFormat('yyyy-LL');
				const items = byMonth.get(k) ?? [];
				sections.push({
					accent: accentForDay(items),
					dayKey: k,
					items,
					label: cursor.setLocale('pt-PT').toFormat('LLLL yyyy'),
				});
				cursor = cursor.plus({ months: 1 });
			}
		}
	}

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
