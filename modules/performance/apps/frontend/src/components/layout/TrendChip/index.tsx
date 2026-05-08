'use client';

import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface TrendChipProps {
	comparisonLabel?: 'vs ano passado' | 'vs média anual' | 'vs período anterior' | 'vs semana passada' | null
	comparisonPreviousValue?: number
	comparisonValue?: number
	goal?: 'decrease' | 'increase'
	percentage?: number
	previousValue?: number
	tooltip?: string
	value?: number
}

/* * */

export function TrendChip({ comparisonLabel = 'vs semana passada', comparisonPreviousValue, comparisonValue, goal = 'increase', percentage, previousValue, tooltip, value }: TrendChipProps) {
	//

	//
	// A. Transform data

	let delta: number;
	let isPositive: boolean;
	let label: string;

	// Use percentage directly if provided
	if (percentage !== undefined) {
		delta = percentage;
		isPositive = delta >= 0;
		label = `${isPositive ? '+' : ''}${delta.toFixed(1)}%`;
	}
	else if (value !== undefined && previousValue !== undefined) {
		// Calculate delta from values
		let currentRatio = value;
		let previousRatio = previousValue;

		if (comparisonValue && comparisonPreviousValue) {
			currentRatio = (value / comparisonValue) * 100;
			previousRatio = (previousValue / comparisonPreviousValue) * 100;
		}

		delta = previousRatio === 0 ? 0 : ((currentRatio - previousRatio) / previousRatio) * 100;
		isPositive = delta >= 0;
		label = `${isPositive ? '+' : ''}${delta.toFixed(1)}%`;
	}
	else {
		// Fallback for missing data
		delta = 0;
		isPositive = true;
		label = '0.0%';
	}

	const color = isPositive ? (goal === 'decrease' ? 'warning' : 'positive') : (goal === 'decrease' ? 'positive' : 'warning');

	//
	// B. Render component

	return (
		<Tooltip label={tooltip || `${label} ${comparisonLabel || ''}`} maw={300} multiline>
			<div className={`${styles.container} ${styles[color]}`}>
				{isPositive ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
				<span className={styles.label}>{label}</span>
				{comparisonLabel && <span className={styles.comparisonLabel}>{comparisonLabel}</span>}
			</div>
		</Tooltip>
	);
}
