'use client';

/* * */

import { cn } from '@/lib/utils';
import { type SamAnalysis } from '@tmlmobilidade/types';
import { Tooltip } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

import { analysisSquareHasValues, analysisSquareTooltipItems } from './analysis-square-shared';

/* * */

export interface AnalysisSquareProps {
	/** When set (e.g. one square per calendar day), overrides filled/empty from `value`. */
	accent?: 'green' | 'orange' | 'red' | 'white'
	/** When provided, tooltip shows all these analyses (one per line). */
	analyses?: SamAnalysis[]
	className?: string
	/** When set, the square is filled with the color of the accent. */
	filled?: boolean
	/** Expand square to container width. */
	fullWidth?: boolean
	onClick?: (analysis: SamAnalysis) => void
	textLabel?: string
	/** Tooltip; when omitted, derived from `value` when present. */
	title?: string
	/** When `accent` is set, optional (e.g. empty day). Otherwise required for styling. */
	value?: SamAnalysis
}

/* * */

export function AnalysisSquare({ accent, analyses, className, filled, fullWidth = false, onClick, textLabel, title, value }: AnalysisSquareProps) {
	const derivedFilled = value != null && analysisSquareHasValues(value);
	const toneClass =
		accent === 'orange'
			? styles.orange
			: accent === 'green'
				? styles.green
				: accent === 'red'
					? styles.red
					: accent === 'white'
						? styles.white
						: derivedFilled
							? styles.green
							: styles.red;

	const filledClass =
		accent === 'green'
			? styles.filledGreen
			: accent === 'orange'
				? styles.filledOrange
				: accent === 'red'
					? styles.filledRed
					: accent === 'white'
						? styles.filledWhite
						: derivedFilled
							? styles.filledGreen
							: styles.filledRed;

	const dataState =
		accent === 'orange'
			? 'warning'
			: accent === 'green' || accent === 'white' || derivedFilled
				? 'filled'
				: 'empty';

	const tooltipAnalyses = analyses?.length ? analyses : value != null ? [value] : [];

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
				filled ? filledClass : toneClass,
				className,
				fullWidth && styles.squareFullWidth,
			)}
			onClick={(event) => {
				event.stopPropagation();
				if (dataState !== 'empty') onClick?.(value);
			}}
		>
			{textLabel}
		</div>
	);

	return (
		<div
			className={cn(styles.squareWithDetails)}
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
		</div>
	);
}

export interface AnalysisSquareRowProps {
	/** One square per analysis entry, in order. */
	analyses: SamAnalysis[]
	className?: string
	filled?: boolean
	fullWidth?: boolean
	onClick?: (analysis: SamAnalysis) => void
	textLabel?: string
	title?: string
}

export function AnalysisSquareRow({ analyses, className, filled, fullWidth = false, onClick, textLabel, title }: AnalysisSquareRowProps) {
	if (!analyses?.length) {
		return <span className={styles.rowEmpty}>sem análises</span>;
	}

	return (
		<div className={cn(styles.row, className)}>
			{analyses.map((value, index) => (
				<AnalysisSquare
					key={`${value.first_transaction_id ?? ''}-${value.last_transaction_id ?? ''}-${index}`}
					analyses={analyses}
					filled={filled === true}
					fullWidth={fullWidth}
					onClick={onClick}
					textLabel={textLabel}
					title={title}
					value={value}
				/>
			))}
		</div>
	);
}
