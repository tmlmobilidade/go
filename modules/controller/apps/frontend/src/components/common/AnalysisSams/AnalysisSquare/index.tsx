'use client';

/* * */

import { type SamAnalysis } from '@tmlmobilidade/types';
import { Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { cn } from '@/lib/utils';
import { analysisSquareHasValues, analysisSquareLabel, analysisSquareTitle } from './analysis-square-shared';

/* * */

export interface AnalysisSquareProps {
	/** When set (e.g. one square per calendar day), overrides filled/empty from `value`. */
	accent?: 'green' | 'orange' | 'red'
	className?: string
	textLabel: string
	/** Tooltip; when omitted, derived from `value` when present. */
	title?: string
	/** When `accent` is set, optional (e.g. empty day). Otherwise required for styling. */
	value?: SamAnalysis
}

/* * */

export function AnalysisSquare({ accent, className, textLabel, title, value }: AnalysisSquareProps) {
	const filled = value != null && analysisSquareHasValues(value);
	const toneClass =
		accent === 'orange'
			? styles.accentOrange
			: accent === 'green'
				? styles.filled
				: accent === 'red'
					? styles.empty
					: filled
						? styles.filled
						: styles.empty;
	const dataState =
		accent === 'orange'
			? 'warning'
			: accent === 'green' || (accent == null && filled)
				? 'filled'
				: 'empty';

	const resolvedTitle = title ?? (value != null ? analysisSquareTitle(value) : undefined);
	const square = (
		<div
			className={cn(styles.square, toneClass, className)}
			data-state={dataState}
			tabIndex={resolvedTitle ? 0 : -1}
		>
			{textLabel}
		</div>
	);

	if (!resolvedTitle) {
		return square;
	}

	return (
		<Tooltip
			closeDelay={80}
			label={resolvedTitle}
			multiline
			openDelay={120}
			position="bottom-start"
			w={100}
			withinPortal
			withArrow
		>
			{square}
		</Tooltip>
	);
}

export interface AnalysisSquareRowProps {
	/** One square per analysis entry, in order. */
	analyses: SamAnalysis[]
	className?: string
}

export function AnalysisSquareRow({ analyses, className }: AnalysisSquareRowProps) {
	if (!analyses?.length) {
		return <span className={styles.rowEmpty}>sem análises</span>;
	}

	return (
		<div className={cn(styles.row, className)}>
			{analyses.map((value, index) => (
				<AnalysisSquare
					key={`${value.first_transaction_id ?? ''}-${value.last_transaction_id ?? ''}-${index}`}
					textLabel={analysisSquareLabel(value)}
					value={value}
				/>
			))}
		</div>
	);
}
