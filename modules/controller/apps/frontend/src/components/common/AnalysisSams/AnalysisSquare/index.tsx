'use client';

/* * */

import { cn } from '@/lib/utils';
import { type SamAnalysis } from '@tmlmobilidade/types';
import { ExpandLabel, Tooltip } from '@tmlmobilidade/ui';
import { type ReactNode, useState } from 'react';

import styles from './styles.module.css';

import { analysisSquareHasValues, analysisSquareLabel, analysisSquareTooltipItems } from './analysis-square-shared';

/* * */

export interface AnalysisSquareProps {
	/** When set (e.g. one square per calendar day), overrides filled/empty from `value`. */
	accent?: 'green' | 'orange' | 'red'
	/** Enables inline detail panel on click (used by AnalysisCalender). */
	allowInlineExpand?: boolean
	/** When provided, tooltip shows all these analyses (one per line). */
	analyses?: SamAnalysis[]
	className?: string
	onClick?: (analysis: SamAnalysis) => void
	textLabel: string
	/** Tooltip; when omitted, derived from `value` when present. */
	title?: string
	/** When `accent` is set, optional (e.g. empty day). Otherwise required for styling. */
	value?: SamAnalysis
}

/* * */

export function AnalysisSquare({ accent, allowInlineExpand = false, analyses, className, onClick, textLabel, title, value }: AnalysisSquareProps) {
	const [showDetails, setShowDetails] = useState(false);
	const filled = value != null && analysisSquareHasValues(value);
	const toneClass = accent === 'orange' ? styles.accentOrange : accent === 'green' ? styles.filled : accent === 'red' ? styles.empty : filled ? styles.filled : styles.empty;
	const dataState = accent === 'orange' ? 'warning' : accent === 'green' || (accent == null && filled) ? 'filled' : 'empty';
	const tooltipAnalyses = analyses?.length ? analyses : value != null ? [value] : [];
	const canShowDetails = allowInlineExpand && tooltipAnalyses.length > 0;

	const renderTooltipList = (): ReactNode => (
		<div className={styles.tooltipContent}>
			{tooltipAnalyses.map((analysis, analysisIndex) => (
				<div key={`${analysis.first_transaction_id ?? ''}-${analysis.last_transaction_id ?? ''}-${analysisIndex}`} className={styles.tooltipAnalysisGroup}>
					{tooltipAnalyses.length > 1 && <div className={styles.tooltipAnalysisTitle}>Analise {analysisIndex + 1}</div>}
					<ul className={styles.tooltipList}>
						{analysisSquareTooltipItems(analysis).map((item, itemIndex) => (
							<li key={`${analysisIndex}-${itemIndex}`} className={styles.tooltipListItem}>
								{item}
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
	const resolvedTooltip = title ?? (tooltipAnalyses.length > 0 ? renderTooltipList() : undefined);
	const square = (
		<div
			data-state={dataState}
			tabIndex={resolvedTooltip ? 0 : -1}
			className={cn(
				styles.square,
				toneClass,
				className,
				canShowDetails && styles.squareClickable,
				showDetails && canShowDetails && styles.squareExpanded,
				showDetails && canShowDetails && styles.squareOpenPulse,
			)}
			onClick={(event) => {
				event.stopPropagation();
				if (canShowDetails) setShowDetails(current => !current);
				if (value != null) onClick?.(value);
			}}
		>
			{textLabel}
		</div>
	);

	return (
		<div
			className={cn(styles.squareWithDetails, showDetails && canShowDetails && styles.squareWithDetailsExpanded)}
			onClick={(event) => {
				event.stopPropagation();
			}}
		>
			{resolvedTooltip
				? (
					<Tooltip
						closeDelay={80}
						label={resolvedTooltip}
						openDelay={120}
						position="bottom-start"
						w={320}
						multiline
						withArrow
						withinPortal
					>
						{square}
					</Tooltip>
				)
				: square}
			{showDetails && canShowDetails && (
				<div className={styles.detailsPanel}>
					<ExpandLabel defaultExpanded>
						{renderTooltipList()}
					</ExpandLabel>
				</div>
			)}
		</div>
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
					analyses={analyses}
					textLabel={analysisSquareLabel(value)}
					value={value}
				/>
			))}
		</div>
	);
}
