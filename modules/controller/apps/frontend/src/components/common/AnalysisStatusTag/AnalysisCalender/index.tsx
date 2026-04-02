'use client';

/* * */

import { type SamAnalysis } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { analysisSquareLabel } from '../AnalysisSquare/analysis-square-shared';
import { AnalysisSquare } from '../AnalysisSquare/index';
import { buildMonthSections, buildSections } from '../AnalysisTimeLine/organized_by_dates';
import { cn } from '@/lib/utils';
import { Divider, Section } from '@tmlmobilidade/ui';

/* * */

export interface AnalysisCalenderProps {
	analyses: SamAnalysis[]
	className?: string
	groupBy?: 'day' | 'month'
	/**
	 * Upper bound on day columns when the container is wide; narrower widths show fewer columns (CSS `auto-fit`).
	 * Override density with `--analysis-calendar-day-min` (e.g. `140px`) via `style` / CSS if needed.
	 */
	maxDaysPerRow?: number
}

/* * */

export function AnalysisCalender({ analyses, className, groupBy = 'day' }: AnalysisCalenderProps) {
	const sections = useMemo(() => {
		if (groupBy === 'month') return buildMonthSections(analyses ?? []);
		return buildSections(analyses ?? []);
	}, [analyses, groupBy]);

	const sectionsByMonth = useMemo(() => {
		if (groupBy !== 'day') return [];
		const grouped = new Map<string, { label: string; sections: typeof sections }>();

		for (const section of sections) {
			if (section.dayKey === 'Sem data') {
				const existing = grouped.get('Sem data');
				if (existing) existing.sections.push(section);
				else grouped.set('Sem data', { label: 'Sem data', sections: [section] });
				continue;
			}

			const dt = DateTime.fromISO(section.dayKey, { zone: 'Europe/Lisbon' });
			if (!dt.isValid) continue;
			const monthKey = dt.toFormat('yyyy-LL');
			const monthLabel = dt.setLocale('pt-PT').toFormat('LLLL yyyy');
			const existing = grouped.get(monthKey);
			if (existing) existing.sections.push(section);
			else grouped.set(monthKey, { label: monthLabel, sections: [section] });
		}

		return [...grouped.entries()]
			.sort(([a], [b]) => {
				if (a === 'Sem data') return 1;
				if (b === 'Sem data') return -1;
				return a.localeCompare(b);
			})
			.map(([, value]) => value);
	}, [groupBy, sections]);

	if (!analyses?.length) {
		return <span className={styles.rowEmpty}>sem análises</span>;
	}

	const renderSection = (section: (typeof sections)[number]) => (
		<div
			key={section.dayKey}
			className={cn(
				styles.dayGroup,
				section.accent === 'green' && styles.dayGroupGreen,
				section.accent === 'orange' && styles.dayGroupOrange,
				section.accent === 'red' && styles.dayGroupRed,
			)}
		>
			<div className={styles.dayLabel}>{section.label}</div>
			<div className={styles.daySquares}>
				{section.items.map((value, index) => (
					<AnalysisSquare
						key={`${value.first_transaction_id ?? ''}-${value.last_transaction_id ?? ''}-${section.dayKey}-${index}`}
						textLabel={analysisSquareLabel(value)}
						value={value}
					/>
				))}
			</div>
		</div>
	);

	if (groupBy === 'day') {
		return (
			<div className={cn(styles.byMonthGroups, className)}>
				{sectionsByMonth.map((group, index) => (
					<div key={group.label}>
						<div className={styles.monthGroup}>
							<div className={styles.monthLabel}>{group.label}</div>
							<div className={styles.organizedByDates}>
								{group.sections.map(renderSection)}
							</div>
						</div>
						<Section gap="md">
							{index < sectionsByMonth.length - 1 && <Divider />}
						</Section>
					</div>
				))}
			</div>
		);
	}

	return (
		<div
			className={cn(styles.organizedByDates, groupBy === 'month' && styles.organizedByMonths, className)}
		>
			{sections.map(renderSection)}
		</div>
	);
}
