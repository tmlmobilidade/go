'use client';

/* * */

// External imports
import { cn } from '@/lib/utils';
import { type SamAnalysis } from '@tmlmobilidade/types';
import { Tooltip } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';

// Style import
import styles from './styles.module.css';

// Shared helpers
import { analysisCountTooltipLabel, analysisSquareHasValues } from './analysis-square-shared';

/* * */

/**
 * Props for the AnalysisSquare component.
 */
export interface AnalysisSquareProps {
	/** Accent color for the square; overrides filled/empty from value if set. */
	accent?: 'green' | 'orange' | 'red' | 'white'
	/** Array of analyses; tooltip shows only how many in this bucket if non-empty. */
	analyses?: SamAnalysis[]
	className?: string
	/** Force the square to appear as filled with the accent color. */
	filled?: boolean
	/** Whether the square should expand to fill its container. */
	fullWidth?: boolean
	/** Handler called when the square is clicked. */
	onClick?: (analysis: SamAnalysis | undefined) => void
	/** Text label rendered inside the square. */
	textLabel?: string
	/** Tooltip text/element. If omitted, will be derived. */
	title?: string
	/** Analysis value for this square; required when no accent, optional otherwise. */
	value?: SamAnalysis
}

/**
 * Renders a colored square to represent a single analysis (or bucket).
 */
export function AnalysisSquare({
	accent,
	analyses,
	className,
	filled = false,
	fullWidth = false,
	onClick,
	textLabel,
	title,
	value,
}: AnalysisSquareProps) {
	// Determine if the square should be filled based on the provided value.
	const derivedFilled = value != null && analysisSquareHasValues(value);

	// Determine accent/tone style CSS class for the square, based on accent & fill state.
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

	// Determine the filled variant CSS class for the square, based on accent & fill state.
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

	// Data-state controls color/interaction appearance.
	const dataState =
		accent === 'orange'
			? 'warning'
			: accent === 'green' || accent === 'white' || derivedFilled
				? 'filled'
				: 'empty';

	// Number of analyses in this "bucket"
	const aggregateCount = analyses != null && analyses.length > 0 ? analyses.length : 0;

	// If showing a single value rather than an aggregate, wrap in an array to reuse rendering.
	const detailAnalyses = aggregateCount > 0 ? [] : value != null ? [value] : [];

	/**
	 * Renders a tooltip for analysis details, if displaying a single value.
	 */
	const renderDetailTooltip = (): ReactNode => (
		<div className={styles.tooltipContent}>
			{detailAnalyses.map((analysis, analysisIndex) => (
				<div
					key={`${analysis.first_transaction_id ?? ''}-${analysis.last_transaction_id ?? ''}-${analysisIndex}`}
					className={styles.tooltipAnalysisGroup}
				>
					{/* Optionally render an index/title for each analysis if there are multiples */}
					{detailAnalyses.length > 1 && (
						<div className={styles.tooltipAnalysisTitle}>
							Analise {analysisIndex + 1}
						</div>
					)}
				</div>
			))}
		</div>
	);

	// Decide what tooltip to show (passed-in, aggregate count, or details).
	const resolvedTooltip =
		title
		?? (aggregateCount > 0
			? analysisCountTooltipLabel(aggregateCount)
			: detailAnalyses.length > 0
				? renderDetailTooltip()
				: undefined);

	// The actual colored square element.
	const square = (
		<div
			data-state={dataState}
			tabIndex={resolvedTooltip ? 0 : -1}
			className={cn(
				styles.square,
				filled ? filledClass : toneClass,
				className,
				fullWidth && styles.squareFullWidth,
				onClick && styles.squareClickable,
			)}
			onClick={onClick
				? (event) => {
					event.stopPropagation();
					onClick(value);
				}
				: undefined}
		>
			{textLabel}
		</div>
	);

	// The square, optionally wrapped in a Tooltip if a tooltip is resolved.
	return (
		<div className={cn(styles.squareWithDetails)}>
			{resolvedTooltip ? (
				<Tooltip
					closeDelay={80}
					label={resolvedTooltip}
					multiline={typeof resolvedTooltip !== 'string'}
					openDelay={120}
					position="bottom-start"
					w={typeof resolvedTooltip === 'string' ? undefined : 320}
					withArrow
					withinPortal
				>
					{square}
				</Tooltip>
			) : square}
		</div>
	);
}

/**
 * Props for AnalysisSquareRow. Represents a row of AnalysisSquares.
 */
export interface AnalysisSquareRowProps {
	/** One square per analysis entry, in order. */
	analyses: SamAnalysis[]
	className?: string
	filled?: boolean
	fullWidth?: boolean
	onClick?: (analysis: SamAnalysis | undefined) => void
	textLabel?: string
	title?: string
}

/**
 * Renders a row of AnalysisSquare components, one for each analysis.
 */
export function AnalysisSquareRow({
	analyses,
	className,
	filled,
	fullWidth = false,
	onClick,
	textLabel,
	title,
}: AnalysisSquareRowProps) {
	// Show "sem análises" if empty array.
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
