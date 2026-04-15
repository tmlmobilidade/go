'use client';

/* * */

import { cn } from '@/lib/utils';
import { type SamAnalysis } from '@tmlmobilidade/types';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { AnalysisSquare } from '../AnalysisSquare';
import { buildMonthSections } from '../organized_by_dates';

/* * */

export interface AnalysisTimeLineProps {
	className?: string
	/** When neither first nor last transaction id is set, the square uses the empty (red) style. */
	value: SamAnalysis
}

/* * */

export function AnalysisTimeLine({ className, value }: AnalysisTimeLineProps) {
	return (
		<AnalysisSquare className={className} value={value} />
	);
}

export interface AnalysisTimeLineRowProps {
	analyses: SamAnalysis[]
	className?: string
	rangeEndTs?: null | number
	rangeStartTs?: null | number
	remarks?: null | string
}

/** One square per month; color from aggregate state (`buildMonthSections` accent). */
export function AnalysisTimeLineRow({ analyses, className, rangeEndTs, rangeStartTs, remarks }: AnalysisTimeLineRowProps) {
	const sections = useMemo(() => {
		const list = analyses ?? [];
		return buildMonthSections(list, { rangeEndTs, rangeStartTs });
	}, [analyses, rangeEndTs, rangeStartTs]);

	if (!analyses?.length) {
		return <span className={styles.rowEmpty}>{remarks ?? 'sem análises'}</span>;
	}

	return (
		<div className={cn(styles.byDayInline, className)}>
			{sections.map(section => (
				<AnalysisSquare
					key={section.dayKey}
					accent={section.accent}
					analyses={section.items.length > 0 ? section.items : undefined}
					className={styles.monthSquare}
					textLabel={section.label}
				/>
			))}
		</div>
	);
}
