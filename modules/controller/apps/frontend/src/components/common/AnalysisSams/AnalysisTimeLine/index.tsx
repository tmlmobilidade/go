/* eslint-disable @stylistic/arrow-parens */
'use client';

/* * */

import { type SamAnalysis } from '@tmlmobilidade/types';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { cn } from '../../../../../../../../../packages/ui/src/lib/utils';
import { AnalysisSquare } from '../AnalysisSquare';
import { analysisSquareLabel, analysisSquareTitle } from '../AnalysisSquare/analysis-square-shared';
import { buildMonthSections } from './organized_by_dates';

/* * */

export interface AnalysisTimeLineProps {
	className?: string
	/** When neither first nor last transaction id is set, the square uses the empty (red) style. */
	value: SamAnalysis
}

/* * */

export function AnalysisTimeLine({ className, value }: AnalysisTimeLineProps) {
	return (
		<AnalysisSquare className={className} textLabel={analysisSquareLabel(value)} value={value} />
	);
}

export interface AnalysisTimeLineRowProps {
	analyses: SamAnalysis[]
	className?: string
}

/** One square per calendar day; color from aggregate state (`buildSections` accent). */
export function AnalysisTimeLineRow({ analyses, className }: AnalysisTimeLineRowProps) {
	const sections = useMemo(() => {
		const list = analyses ?? [];
		return buildMonthSections(list);
	}, [analyses]);

	if (!analyses?.length) {
		return <span className={styles.rowEmpty}>sem análises</span>;
	}

	return (
		<div className={cn(styles.byDayInline, className)}>
			{sections.map(section => {
				const dayTitle =
					section.items.length === 0
						? undefined
						: section.items.map(a => analysisSquareTitle(a)).filter(Boolean).join('\n') || undefined;

				return (
					<AnalysisSquare
						key={section.dayKey}
						accent={section.accent}
						textLabel={section.label}
						title={dayTitle}
						value={section.items[0]}
					/>
				);
			})}
		</div>
	);
}
