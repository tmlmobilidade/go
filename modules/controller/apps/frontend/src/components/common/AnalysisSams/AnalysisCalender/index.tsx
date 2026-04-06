'use client';

/* * */

import { cn } from '@/lib/utils';
import { type SamAnalysis } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { type ReactNode, useMemo, useState } from 'react';

import styles from './styles.module.css';

import { analysisSquareLabel } from '../AnalysisSquare/analysis-square-shared';
import { AnalysisSquare } from '../AnalysisSquare/index';
import { buildMonthSections, buildSections } from '../AnalysisTimeLine/organized_by_dates';

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

export function AnalysisCalender({ analyses, className, onClick }: AnalysisCalenderProps) {
	const [selectedMonthKey, setSelectedMonthKey] = useState<null | string>(null);

	const sections = useMemo(() => buildMonthSections(analyses ?? []), [analyses]);
	const monthDaySectionsByKey = useMemo(() => {
		const grouped = new Map<string, ReturnType<typeof buildSections>>();
		for (const monthSection of sections) {
			if (monthSection.dayKey === 'Sem data') continue;
			const monthStart = DateTime
				.fromFormat(monthSection.dayKey, 'yyyy-LL', { zone: 'Europe/Lisbon' })
				.startOf('month');
			if (!monthStart.isValid) continue;
			const monthEnd = monthStart.endOf('month');

			const analysesInMonth = (analyses ?? []).filter((analysis) => {
				const startTs = analysis.start_time;
				const endTs = analysis.end_time;
				if (startTs == null && endTs == null) return false;

				const rangeStart = DateTime.fromMillis(startTs ?? endTs ?? 0).setZone('Europe/Lisbon').startOf('day');
				const rangeEnd = DateTime.fromMillis(endTs ?? startTs ?? 0).setZone('Europe/Lisbon').startOf('day');
				if (!rangeStart.isValid || !rangeEnd.isValid) return false;

				const from = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
				const to = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
				return from <= monthEnd && to >= monthStart;
			});

			grouped.set(
				monthSection.dayKey,
				buildSections(analysesInMonth).filter(section => section.dayKey.startsWith(`${monthSection.dayKey}-`)),
			);
		}
		return grouped;
	}, [analyses, sections]);

	if (!analyses?.length) {
		return <span className={styles.rowEmpty}>sem análises</span>;
	}

	const renderSection = (
		section: (typeof sections)[number],
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
								section.dayKey !== 'Sem data',
								selected,
								sectionSquares,
								section.dayKey === 'Sem data'
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
