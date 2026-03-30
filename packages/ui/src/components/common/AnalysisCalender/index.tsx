'use client';

/* * */

import { type SamAnalysis } from '@tmlmobilidade/types';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { cn } from '../../../lib/utils';
import { analysisSquareLabel } from '../AnalysisSquare/analysis-square-shared';
import { AnalysisSquare } from '../AnalysisSquare/index';
import { buildSections } from '../AnalysisTimeLine/organized_by_dates';

/* * */

export interface AnalysisCalenderProps {
	analyses: SamAnalysis[]
	className?: string
}

/* * */

export function AnalysisCalender({ analyses, className }: AnalysisCalenderProps) {
	const sections = useMemo(() => buildSections(analyses ?? []), [analyses]);

	if (!analyses?.length) {
		return <span className={styles.rowEmpty}>sem análises</span>;
	}

	return (
		<div className={cn(styles.organizedByDates, className)}>
			{sections.map(section => (
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
						{section.items.length === 0 ? (
							<span className={styles.dayGapHint}>—</span>
						) : (
							section.items.map((value, index) => (
								<AnalysisSquare
									key={`${value.first_transaction_id ?? ''}-${value.last_transaction_id ?? ''}-${section.dayKey}-${index}`}
									textLabel={analysisSquareLabel(value)}
									value={value}
								/>
							))
						)}
					</div>
				</div>
			))}
		</div>
	);
}
