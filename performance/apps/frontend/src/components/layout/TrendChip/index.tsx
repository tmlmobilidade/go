'use client';

/* * */

import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface TrendChipProps {
	comparisonPreviousValue?: number
	comparisonValue?: number
	goal: 'decrease' | 'increase'
	previousValue: number
	value: number
}

/* * */

export function TrendChip({ comparisonPreviousValue, comparisonValue, goal, previousValue, value }: TrendChipProps) {
	//

	//
	// A. Transform data

	let currentRatio = value;
	let previousRatio = previousValue;

	if (comparisonValue && comparisonPreviousValue) {
		currentRatio = (value / comparisonValue) * 100;
		previousRatio = (previousValue / comparisonPreviousValue) * 100;
	}

	const delta = previousRatio === 0 ? 0 : ((currentRatio - previousRatio) / previousRatio) * 100;
	const isPositive = delta >= 0;
	const label = `${isPositive ? '+' : ''}${delta.toFixed(1)}%`;
	const color = isPositive ? (goal === 'decrease' ? 'warning' : 'positive') : (goal === 'decrease' ? 'positive' : 'warning');

	//
	// B. Render component

	return (
		<div className={`${styles.container} ${styles[color]}`}>
			{isPositive ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
			<span className={styles.label}>{label}</span>
			<span className={styles.comparisonLabel}>vs semana passada</span>
		</div>
	);
}
