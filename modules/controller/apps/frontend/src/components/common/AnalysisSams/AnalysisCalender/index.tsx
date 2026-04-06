'use client';

/* * */

import { cn } from '@/lib/utils';
import { type SamAnalysis } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { type ReactNode, useMemo, useState } from 'react';

import styles from './styles.module.css';

import { AnalysisSquare } from '../AnalysisSquare';
import { analysisSquareLabel } from '../AnalysisSquare/analysis-square-shared';
import {
	buildMonthSections,
	buildSections,
	type DaySection,
	SEM_DATA_KEY,
} from '../AnalysisTimeLine/organized_by_dates';

/* * */

export interface AnalysisCalenderProps {
	analyses: SamAnalysis[]
	className?: string
	/**
	 * Upper bound on day columns when the container is wide; narrower widths show fewer columns (CSS `auto-fit`).
	 * Override density with `--analysis-calendar-day-min` (e.g. `140px`) via `style` / CSS if needed.
	 */
	maxDaysPerRow?: number
	onClick?: (analysis: SamAnalysis) => void
}

/* * */

const CALENDAR_TZ = 'Europe/Lisbon';

const isAnalysisInMonthRange = (
	analysis: SamAnalysis,
	monthStart: DateTime,
	monthEnd: DateTime,
) => {
	const startTs = analysis.start_time;
	const endTs = analysis.end_time;
	if (startTs == null && endTs == null) return false;

	const rangeStart = DateTime.fromMillis(startTs ?? endTs ?? 0).setZone(CALENDAR_TZ).startOf('day');
	const rangeEnd = DateTime.fromMillis(endTs ?? startTs ?? 0).setZone(CALENDAR_TZ).startOf('day');
	if (!rangeStart.isValid || !rangeEnd.isValid) return false;

	const from = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
	const to = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
	return from <= monthEnd && to >= monthStart;
};

const buildDaySectionsForMonth = (analyses: SamAnalysis[], monthKey: string): DaySection[] => {
	const monthStart = DateTime.fromFormat(monthKey, 'yyyy-LL', { zone: CALENDAR_TZ }).startOf('month');
	if (!monthStart.isValid) return [];
	const monthEnd = monthStart.endOf('month');
	const analysesInMonth = analyses.filter(analysis => isAnalysisInMonthRange(analysis, monthStart, monthEnd));
	return buildSections(analysesInMonth).filter(section => section.dayKey.startsWith(`${monthKey}-`));
};

export function AnalysisCalender({ analyses, className, onClick }: AnalysisCalenderProps) {
	const [selectedMonthKey, setSelectedMonthKey] = useState<null | string>(null);

	const sections = useMemo(() => buildMonthSections(analyses ?? []), [analyses]);
	const monthDaySectionsByKey = useMemo(() => {
		const grouped = new Map<string, DaySection[]>();
		for (const monthSection of sections) {
			if (monthSection.dayKey === SEM_DATA_KEY) continue;
			grouped.set(monthSection.dayKey, buildDaySectionsForMonth(analyses ?? [], monthSection.dayKey));
		}
		return grouped;
	}, [analyses, sections]);

	if (!analyses?.length) {
		return <span className={styles.rowEmpty}>sem análises</span>;
	}

	const renderSection = (
		section: DaySection,
		clickable: boolean,
		selected: boolean,
		squares: ReactNode,
		onSectionClick?: () => void,
	) => (
		<div
			key={section.dayKey}
			onClick={onSectionClick}
			className={cn(
				styles.dayGroup,
				clickable && styles.dayGroupClickable,
				selected && styles.dayGroupSelected,
				section.accent === 'green' && styles.dayGroupGreen,
				section.accent === 'orange' && styles.dayGroupOrange,
				section.accent === 'red' && styles.dayGroupRed,
			)}
		>
			<div className={styles.dayLabel}>{section.label}</div>
			<div className={styles.daySquares}>{squares}</div>
		</div>
	);

	return (
		<div className={cn(styles.byMonthGroups, className)}>
			<div className={cn(styles.organizedByDates, styles.organizedByMonths)}>
				{sections.map((section) => {
					const selected = selectedMonthKey === section.dayKey;
					const daySections = selected ? monthDaySectionsByKey.get(section.dayKey) ?? [] : [];
					const sectionSquares = selected
						? daySections.map((daySection, index) => (
							<div key={`${daySection.dayKey}-${index}`} className={styles.dayBreakdownRow}>
								<div className={styles.dayBreakdownLabel}>{daySection.label}</div>
								<div className={styles.dayBreakdownSquares}>
									{daySection.items.map((value, valueIndex) => (
										<AnalysisSquare
											key={`${value.first_transaction_id ?? ''}-${value.last_transaction_id ?? ''}-${daySection.dayKey}-${valueIndex}`}
											textLabel={analysisSquareLabel(value)}
											value={value}
										/>
									))}
								</div>
							</div>
						))
						: section.items.map((value, index) => (
							<AnalysisSquare
								key={`${value.first_transaction_id ?? ''}-${value.last_transaction_id ?? ''}-${section.dayKey}-${index}`}
								textLabel={analysisSquareLabel(value)}
								value={value}
							/>
						));

					return (
						<div key={section.dayKey} className={styles.monthGroup}>
							{renderSection(
								section,
								section.dayKey !== SEM_DATA_KEY,
								selected,
								sectionSquares,
								section.dayKey === SEM_DATA_KEY
									? undefined
									: () => {
										setSelectedMonthKey(current => (current === section.dayKey ? null : section.dayKey));
										if (section.items[0] != null) onClick?.(section.items[0]);
									},
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
