/* * */

import { type SamAnalysis } from '@/sams/sam-analysis.js';
import { type SamTimelineSummary } from '@/sams/sam-timeline-summary.js';
import { DateTime } from 'luxon';

const TZ = 'Europe/Lisbon';

/**
 * Adds `has_empty_days_in_range` to each `timeline_summary.months[]` row when the
 * seen window includes a Lisbon calendar day with no analysis covering it.
 */
export function withTimelineMonthGapFlags(
	timeline: null | SamTimelineSummary | undefined,
	analyses: SamAnalysis[],
	seenFirst: null | number | undefined,
	seenLast: null | number | undefined,
): SamTimelineSummary {
	const base = timeline ?? { months: [] };
	const months = base.months ?? [];
	if (months.length === 0) return base;
	if (seenFirst == null || seenLast == null || analyses.length === 0) {
		return { ...base, months: months.map(m => ({ ...m, has_empty_days_in_range: false })) };
	}

	let start = DateTime.fromMillis(seenFirst).setZone(TZ).startOf('day');
	let end = DateTime.fromMillis(seenLast).setZone(TZ).startOf('day');
	if (start > end)
		[start, end] = [end, start];

	const coveredDays = new Set<string>();
	for (const a of analyses) {
		markCoveredDays(coveredDays, a);
	}

	const gapMonths = new Set<string>();
	for (let c = start; c <= end; c = c.plus({ days: 1 })) {
		const iso = c.toISODate();
		if (iso && !coveredDays.has(iso))
			gapMonths.add(c.toFormat('yyyy-LL'));
	}

	return {
		...base,
		months: months.map((m) => {
			const raw = (m as { key?: unknown }).key ?? (m as { month?: unknown }).month;
			const mk = normalizeMonthBucketKey(raw);
			return { ...m, has_empty_days_in_range: mk !== null && gapMonths.has(mk) };
		}),
	};
}

function normalizeMonthBucketKey(raw: unknown): null | string {
	if (raw == null) return null;
	if (typeof raw === 'number' && Number.isFinite(raw)) {
		const n = Math.trunc(raw);
		if (n < 190_001 || n > 210_012) return null;
		const y = Math.floor(n / 100);
		const mo = n % 100;
		if (mo < 1 || mo > 12) return null;
		const dt = DateTime.fromObject({ day: 1, month: mo, year: y }, { zone: TZ });
		return dt.isValid ? dt.toFormat('yyyy-LL') : null;
	}
	const s = String(raw).trim();
	const loose = /^(\d{4})-(\d{1,2})$/.exec(s);
	if (loose) {
		const dt = DateTime.fromObject({ day: 1, month: Number(loose[2]), year: Number(loose[1]) }, { zone: TZ });
		return dt.isValid ? dt.toFormat('yyyy-LL') : null;
	}
	return null;
}

function markCoveredDays(coveredDays: Set<string>, a: SamAnalysis): void {
	const st = a.start_time;
	const et = a.end_time;
	if (st == null && et == null) return;
	if (st != null && et != null) {
		let x = DateTime.fromMillis(st).setZone(TZ).startOf('day');
		let y = DateTime.fromMillis(et).setZone(TZ).startOf('day');
		if (x > y)
			[x, y] = [y, x];
		for (let c = x; c <= y; c = c.plus({ days: 1 })) {
			const iso = c.toISODate();
			if (iso) coveredDays.add(iso);
		}
		return;
	}
	const ts = st ?? et!;
	const day = DateTime.fromMillis(ts).setZone(TZ).toISODate();
	if (day) coveredDays.add(day);
}
