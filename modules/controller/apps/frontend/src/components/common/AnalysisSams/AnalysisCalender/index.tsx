'use client';

/* * */

import { cn } from '@/lib/utils';
import { type SamAnalysis } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

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
	onClick?: (analysis: SamAnalysis) => void
}

/* * */

const CALENDAR_TZ = 'Europe/Lisbon';
const CLOSE_ANIMATION_MS = 220;

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
	const [closingMonthKey, setClosingMonthKey] = useState<null | string>(null);
	const closeTimerRef = useRef<null | number>(null);

	useEffect(
		() => () => {
			if (closeTimerRef.current != null) window.clearTimeout(closeTimerRef.current);
		},
		[],
	);

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
					const closing = closingMonthKey === section.dayKey;
					const showBreakdown = selected || closing;
					const daySections = showBreakdown ? monthDaySectionsByKey.get(section.dayKey) ?? [] : [];
					const sectionSquares = showBreakdown
						? daySections.map((daySection, index) => (
							<div
								key={`${daySection.dayKey}-${index}`}
								className={cn(styles.dayBreakdownRow, closing && styles.dayBreakdownRowClosing)}
							>
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
										if (closeTimerRef.current != null) {
											window.clearTimeout(closeTimerRef.current);
											closeTimerRef.current = null;
										}

										if (selectedMonthKey === section.dayKey) {
											setClosingMonthKey(section.dayKey);
											closeTimerRef.current = window.setTimeout(() => {
												setSelectedMonthKey(current => (current === section.dayKey ? null : current));
												setClosingMonthKey(current => (current === section.dayKey ? null : current));
												closeTimerRef.current = null;
											}, CLOSE_ANIMATION_MS);
										} else {
											setClosingMonthKey(null);
											setSelectedMonthKey(section.dayKey);
										}

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
