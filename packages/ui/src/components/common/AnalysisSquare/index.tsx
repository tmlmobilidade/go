'use client';

/* * */

import styles from './styles.module.css';

import { cn } from '../../../lib/utils';

/* * */

export interface AnalysisSquareProps {
	className?: string
	/** When `null`, `undefined`, or `''`, the square uses the empty (red) style. */
	value: null | number | string | undefined
}

/* * */

export function AnalysisSquare({ className, value }: AnalysisSquareProps) {
	const filled = value !== null && value !== undefined && value !== '';

	return (
		<div
			className={cn(styles.square, filled ? styles.filled : styles.empty, className)}
			data-state={filled ? 'filled' : 'empty'}
		>
			{filled ? String(value) : '—'}
		</div>
	);

	//
}
