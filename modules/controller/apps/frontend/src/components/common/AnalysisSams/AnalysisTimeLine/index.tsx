'use client';

/* * */

import { cn } from '@/lib/utils';
import { type SamTimelineSummary } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { AnalysisSquare } from '../AnalysisSquare';
import { analysisTimelinePeriodTooltipLabel } from '../AnalysisSquare/analysis-square-shared';
import { accentFromSuccessFailedCounts, normalizeTimelineCounts } from '../timeline-counts';

/* * */

const LISBON_ZONE = 'Europe/Lisbon';

/**
 * Normalizes month bucket values from the API to the same `yyyy-LL` keys as {@link monthKeysBetweenMillis}
 * so lookups match and counts are not dropped (strings, BSON-ish numbers, `YYYYMM` integers).
 */
function canonicalTimelineMonthKey(raw: null | number | string | undefined): null | string {
	if (raw == null) return null;
	if (typeof raw === 'number' && Number.isFinite(raw)) {
		const n = Math.trunc(raw);
		// Compact YYYYMM (e.g. 202506)
		if (n >= 190_001 && n <= 210_012) {
			const year = Math.floor(n / 100);
			const month = n % 100;
			if (month >= 1 && month <= 12) {
				const dt = DateTime.fromObject({ day: 1, month, year }, { zone: LISBON_ZONE });
				if (dt.isValid)
					return dt.toFormat('yyyy-LL');
			}
		}
		return null;
	}
	const s = String(raw).trim();
	if (!s) return null;
	const looseYm = /^(\d{4})-(\d{1,2})$/.exec(s);
	if (looseYm) {
		const y = Number(looseYm[1]);
		const mo = Number(looseYm[2]);
		if (Number.isFinite(y) && mo >= 1 && mo <= 12) {
			const dt = DateTime.fromObject({ day: 1, month: mo, year: y }, { zone: LISBON_ZONE });
			if (dt.isValid)
				return dt.toFormat('yyyy-LL');
		}
	}
	const withZone = { zone: LISBON_ZONE };
	for (const fmt of ['yyyy-LL', 'yyyy-MM', 'yyyy-M'] as const) {
		const dt = DateTime.fromFormat(s, fmt, withZone);
		if (dt.isValid)
			return dt.startOf('month').toFormat('yyyy-LL');
	}
	const iso = DateTime.fromISO(s, withZone);
	if (iso.isValid)
		return iso.startOf('month').toFormat('yyyy-LL');
	return null;
}

/** Month keys `yyyy-LL` from seen range; allows a single bound via `??` pairing. */
function monthKeysBetweenMillis(rangeStartTs?: null | number, rangeEndTs?: null | number): string[] {
	const start = rangeStartTs ?? rangeEndTs;
	const end = rangeEndTs ?? rangeStartTs;
	if (start == null || end == null) return [];
	const first = DateTime.fromMillis(Math.min(start, end), { zone: LISBON_ZONE }).startOf('month');
	const last = DateTime.fromMillis(Math.max(start, end), { zone: LISBON_ZONE }).startOf('month');
	if (!first.isValid || !last.isValid) return [];
	const keys: string[] = [];
	let cursor = first;
	while (cursor <= last) {
		keys.push(cursor.toFormat('yyyy-LL'));
		cursor = cursor.plus({ months: 1 });
	}
	return keys;
}

function formatMonthChipLabel(monthKey: string): string {
	const monthDate = DateTime.fromFormat(monthKey, 'yyyy-LL', { locale: 'pt-PT', zone: LISBON_ZONE });
	const monthShort = monthDate.toFormat('LLLL').slice(0, 3);
	const yearShort = monthDate.toFormat('yy');
	return `${monthShort} ${yearShort}`;
}

export interface AnalysisTimeLineRowProps {
	className?: string
	rangeEndTs?: null | number
	rangeStartTs?: null | number
	remarks?: null | string
	timelineSummary?: null | SamTimelineSummary
}

interface MonthSection {
	dayKey: string
	failed_count: number
	label: string
	successful_count: number
}

/** One square per month; color from {@link accentFromSuccessFailedCounts} (API does not send accent). */
export function AnalysisTimeLineRow({ className, rangeEndTs, rangeStartTs, remarks, timelineSummary }: AnalysisTimeLineRowProps) {
	const placeholderSections = useMemo((): MonthSection[] => {
		return monthKeysBetweenMillis(rangeStartTs, rangeEndTs).map(monthKey => ({
			dayKey: monthKey,
			failed_count: 0,
			label: formatMonthChipLabel(monthKey),
			successful_count: 0,
		}));
	}, [rangeEndTs, rangeStartTs]);

	const summarySections = useMemo((): MonthSection[] => {
		if (!timelineSummary) return [];
		const normalizedMonths = (timelineSummary.months ?? [])
			.map((item) => {
				const rawKey =
					(item as { key?: unknown }).key
					?? (item as { month?: unknown }).month;
				const key = canonicalTimelineMonthKey(
					rawKey == null
						? undefined
						: typeof rawKey === 'number' || typeof rawKey === 'string'
							? rawKey
							: String(rawKey),
				);
				if (!key) return null;
				const { failed, successful } = normalizeTimelineCounts({
					failed_count: item.failed_count,
					successful_count: item.successful_count,
				});
				return {
					failed_count: failed,
					key,
					successful_count: successful,
				};
			})
			.filter((item): item is { failed_count: number, key: string, successful_count: number } => item != null);
		const monthDataMap = new Map<string, { failed_count: number, successful_count: number }>(
			normalizedMonths.map(item => [item.key, item]),
		);
		const timelineHasData = normalizedMonths.length > 0 || timelineSummary.undated != null;
		if (!timelineHasData) return [];

		const fromRange = monthKeysBetweenMillis(rangeStartTs, rangeEndTs);
		/** Include every month present in the summary, not only the seen_* window — otherwise chips can show 0 / “no” while the calendar still has analysis in that month. */
		const dataMonthKeys = [...monthDataMap.keys()].sort((a, b) => a.localeCompare(b));
		const monthKeySet = new Set<string>([...fromRange, ...dataMonthKeys]);
		const monthKeys = [...monthKeySet].sort((a, b) => a.localeCompare(b));

		const monthSections: MonthSection[] = monthKeys.map((monthKey) => {
			const monthData = monthDataMap.get(monthKey);
			return {
				dayKey: monthKey,
				failed_count: monthData?.failed_count ?? 0,
				label: formatMonthChipLabel(monthKey),
				successful_count: monthData?.successful_count ?? 0,
			};
		});

		if (timelineSummary.undated) {
			const u = timelineSummary.undated;
			const { failed, successful } = normalizeTimelineCounts({
				failed_count: u.failed_count,
				successful_count: u.successful_count,
			});
			monthSections.push({
				dayKey: 'Sem data',
				failed_count: failed,
				label: 'Sem data',
				successful_count: successful,
			});
		}

		return monthSections;
	}, [rangeEndTs, rangeStartTs, timelineSummary]);

	if (summarySections.length === 0 && placeholderSections.length === 0) {
		if (timelineSummary) {
			return (
				<div className={cn(styles.byDayInline, className)}>
					<AnalysisSquare
						accent="white"
						className={styles.monthSquare}
						textLabel="Sem data"
						title={analysisTimelinePeriodTooltipLabel({
							failed: 0,
							periodLabel: 'Sem data',
							successful: 0,
							total: 0,
						})}
					/>
				</div>
			);
		}
		return <span className={styles.rowEmpty}>{remarks ?? 'sem análises'}</span>;
	}

	const renderedSquares = summarySections.length > 0
		? summarySections.map(section => (
			<AnalysisSquare
				key={section.dayKey}
				accent={accentFromSuccessFailedCounts(section.successful_count, section.failed_count)}
				className={styles.monthSquare}
				textLabel={section.label}
				title={analysisTimelinePeriodTooltipLabel({
					failed: section.failed_count,
					periodLabel: section.label,
					successful: section.successful_count,
					total: section.successful_count + section.failed_count,
				})}
			/>
		))
		: placeholderSections.length > 0
			? placeholderSections.map(section => (
				<AnalysisSquare
					key={section.dayKey}
					accent={accentFromSuccessFailedCounts(section.successful_count, section.failed_count)}
					className={styles.monthSquare}
					textLabel={section.label}
					title={analysisTimelinePeriodTooltipLabel({
						failed: section.failed_count,
						periodLabel: section.label,
						successful: section.successful_count,
						total: section.successful_count + section.failed_count,
					})}
				/>
			))
			: null;
	return (
		<div className={cn(styles.byDayInline, className)}>
			{renderedSquares}
		</div>
	);
}
