'use client';

/* * */

// External imports
import { cn } from '@/lib/utils';
import { type SamAnalysis } from '@tmlmobilidade/types';
import { Tooltip } from '@tmlmobilidade/ui';

// Style import
import styles from './styles.module.css';

// Shared helpers
import { analysisCountTooltipLabel, analysisSquareHasValues, getAnalysisBucketCounts } from './analysis-square-shared';

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

type SquareAccent = NonNullable<AnalysisSquareProps['accent']>;

const TONE_CLASS_BY_ACCENT: Record<SquareAccent, string> = {
	green: styles.green,
	orange: styles.orange,
	red: styles.red,
	white: styles.white,
};

const FILLED_CLASS_BY_ACCENT: Record<SquareAccent, string> = {
	green: styles.filledGreen,
	orange: styles.filledOrange,
	red: styles.filledRed,
	white: styles.filledWhite,
};

/**
 * Renders a colored square to represent a single analysis (or bucket).
 */
export function AnalysisSquare({ accent, analyses, className, filled = false, fullWidth = false, onClick, textLabel, title, value }: AnalysisSquareProps) {
	const valueHasTransactions = value != null && analysisSquareHasValues(value);
	const resolvedAccent = accent ?? 'white';
	const toneClass = resolvedAccent != null
		? TONE_CLASS_BY_ACCENT[resolvedAccent]
		: valueHasTransactions
			? styles.green
			: styles.red;
	const filledClass = resolvedAccent != null
		? FILLED_CLASS_BY_ACCENT[resolvedAccent]
		: valueHasTransactions
			? styles.filledGreen
			: styles.filledRed;
	const dataState = resolvedAccent === 'orange'
		? 'warning'
		: resolvedAccent === 'green' || resolvedAccent === 'white' || valueHasTransactions
			? 'filled'
			: 'empty';
	const hasAggregateAnalyses = analyses != null && analyses.length > 0;
	const detailTooltip = value != null
		? analysisCountTooltipLabel({
			failed: valueHasTransactions ? 0 : 1,
			successful: valueHasTransactions ? 1 : 0,
			total: 1,
		})
		: undefined;
	const resolvedTooltip =
		title
		?? (hasAggregateAnalyses
			? analysisCountTooltipLabel(getAnalysisBucketCounts(analyses))
			: detailTooltip
				? detailTooltip
				: undefined);
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
	return (
		<div className={cn(styles.squareWithDetails)}>
			{resolvedTooltip ? (
				<Tooltip
					closeDelay={80}
					label={resolvedTooltip}
					multiline={false}
					openDelay={120}
					position="bottom-start"
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
