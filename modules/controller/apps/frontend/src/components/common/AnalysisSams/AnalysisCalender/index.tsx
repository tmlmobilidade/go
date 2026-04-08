'use client';

/* * */

import { cn } from '@/lib/utils';
import { type SamAnalysis } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { AnalysisSquare } from '../AnalysisSquare';
import { analysisSquareLabel } from '../AnalysisSquare/analysis-square-shared';
import {
	buildMonthSections,
	buildSections,
	type DayAccent,
	type DaySection,
	SEM_DATA_KEY,
} from '../AnalysisTimeLine/organized_by_dates';

/* * */

export interface AnalysisCalenderProps {
	analyses: SamAnalysis[]
	className?: string
	rangeEndTs?: null | number
	rangeStartTs?: null | number
}

/* * */

const CALENDAR_TZ = 'Europe/Lisbon';
const monthKeyFromDayKey = (dayKey: string): null | string => {
	const dt = DateTime.fromISO(dayKey, { zone: CALENDAR_TZ });
	if (!dt.isValid) return null;
	return dt.toFormat('yyyy-LL');
};

const toSquareAccent = (accent: DayAccent): 'green' | 'orange' | 'red' | 'white' => accent;

export function AnalysisCalender({ analyses, className, rangeEndTs, rangeStartTs }: AnalysisCalenderProps) {
	const sections = useMemo(() => buildMonthSections(analyses ?? [], { rangeEndTs, rangeStartTs }), [analyses, rangeEndTs, rangeStartTs]);
	const allDaySections = useMemo(() => buildSections(analyses ?? [], { rangeEndTs, rangeStartTs }), [analyses, rangeEndTs, rangeStartTs]);
	const monthDaySectionsByKey = useMemo(() => {
		const grouped = new Map<string, DaySection[]>();
		for (const daySection of allDaySections) {
			if (daySection.dayKey === SEM_DATA_KEY) continue;
			const monthKey = monthKeyFromDayKey(daySection.dayKey);
			if (monthKey == null) continue;
			const current = grouped.get(monthKey) ?? [];
			current.push(daySection);
			grouped.set(monthKey, current);
		}
		return grouped;
	}, [allDaySections]);

	if (sections.length === 0) {
		return <span className={styles.rowEmpty}>sem análises</span>;
	}

	return (
		<div className={cn(styles.byMonthGroups, className)}>
			<div className={cn(styles.organizedByDates, styles.organizedByMonths)}>
				{sections.map((section) => {
					const daySections = section.dayKey === SEM_DATA_KEY ? [] : monthDaySectionsByKey.get(section.dayKey) ?? [];

					return (
						<div key={section.dayKey} className={styles.monthGroup}>
							<div
								className={cn(
									styles.dayGroup,
									section.accent === 'green' && styles.dayGroupGreen,
									section.accent === 'orange' && styles.dayGroupOrange,
									section.accent === 'red' && styles.dayGroupRed,
									section.accent === 'white' && styles.dayGroupWhite,
								)}
							>
								<div className={styles.dayLabel}>{section.label}</div>
								<div className={styles.daySquares}>
									{section.dayKey === SEM_DATA_KEY
										? section.items.map((value, index) => (
											<AnalysisSquare
												key={`${value.first_transaction_id ?? ''}-${value.last_transaction_id ?? ''}-${index}`}
												textLabel={analysisSquareLabel(value)}
												value={value}
											/>
										))
										: daySections.map(daySection => (
											<div key={daySection.dayKey} className={styles.dayTile}>
												<div className={styles.dayBreakdownLabel}>{daySection.label}</div>
												<AnalysisSquare
													accent={toSquareAccent(daySection.accent)}
													analyses={daySection.items}
													className={styles.dayTileSquare}
													title={daySection.items.length > 0 ? undefined : 'sem validações'}
												/>
											</div>
										))}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
