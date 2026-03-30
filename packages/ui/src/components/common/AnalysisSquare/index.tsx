'use client';

/* * */

import { type SamAnalysis } from '@tmlmobilidade/types';

import styles from './styles.module.css';

import { cn } from '../../../lib/utils';

/* * */

const LAST_TYPE_LABEL: Record<NonNullable<SamAnalysis['last_transaction_type']>, string> = {
	location: 'L',
	on_board_refund: 'R',
	on_board_sale: 'S',
	validation: 'V',
};

export interface AnalysisSquareProps {
	className?: string
	/** When neither first nor last transaction id is set, the square uses the empty (red) style. */
	value: SamAnalysis
}

/* * */

export function AnalysisSquare({ className, value }: AnalysisSquareProps) {
	const filled = value.last_transaction_id != null || value.first_transaction_id != null;
	let label = '-';
	if (filled) {
		const type = value.last_transaction_type ?? value.first_transaction_type;
		if (type && LAST_TYPE_LABEL[type]) label = LAST_TYPE_LABEL[type];
		else label = '•';
	}

	const title = filled
		? [value.last_transaction_type, value.last_transaction_id].filter(Boolean).join(' · ')
		: undefined;

	return (
		<div
			className={cn(styles.square, filled ? styles.filled : styles.empty, className)}
			data-state={filled ? 'filled' : 'empty'}
			title={title}
		>
			{label}
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
					value={value}
				/>
			))}
		</div>
	);
}
