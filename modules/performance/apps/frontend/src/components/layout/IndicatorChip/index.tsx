'use client';

import StatusCircle from '@/components/layout/StatusCircle';
import { Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface IndicatorChipProps {
	/** Indicates if the goal is to decrease or increase the value for a positive status. */
	goal: 'decrease' | 'increase'
	/** Optional. A tuple [min, max] representing the target percentage range for a 'warning' status. */
	targetRange?: [number, number]
	/** Optional. A single target percentage value for comparison (used if targetRange is not provided). */
	targetValue?: number
	/** The denominator for calculating the percentage (e.g., total possible or scheduled value). */
	totalValue: number
	/** The numerator for calculating the percentage (e.g., achieved or accomplished value). */
	value: number
}

/* * */

export function IndicatorChip({ goal, targetRange, targetValue, totalValue, value }: IndicatorChipProps) {
	let status: 'negative' | 'positive' | 'warning';
	const delta = (value / totalValue) * 100;
	const label = `${Math.abs(delta).toFixed(1)}%`;
	const isInverted = goal === 'decrease';

	if (targetRange) {
		const [min, max] = targetRange;

		const adjustedDelta = isInverted ? 100 - delta : delta;
		const adjustedMin = isInverted ? 100 - max : min;
		const adjustedMax = isInverted ? 100 - min : max;

		if (adjustedDelta < adjustedMin) {
			status = 'negative';
		}
		else if (adjustedDelta > adjustedMax) {
			status = 'positive';
		}
		else {
			status = 'warning';
		}
	}
	else {
		const meetsTarget = isInverted ? delta <= targetValue : delta >= targetValue;
		status = meetsTarget ? 'positive' : 'negative';
	}

	return (
		<Tooltip label={`Em relação ao objetivo de ${targetRange ? `${targetRange[0]}% - ${targetRange[1]}%` : `${targetValue || 100}%`}`}>
			<div className={`${styles.container} ${styles[status]}`}>
				<StatusCircle status={status} />
				<span className={styles.label}>{label}</span>
			</div>
		</Tooltip>
	);
}
