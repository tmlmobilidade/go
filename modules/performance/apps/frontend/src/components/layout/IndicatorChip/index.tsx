'use client';

/* * */

import StatusCircle from '@/components/layout/StatusCircle';
import { Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface IndicatorChipProps {
	goal: 'decrease' | 'increase'
	targetRange?: [number, number]
	targetValue?: number
	totalValue: number
	value: number
}

/* * */

export function IndicatorChip({ goal, targetRange, targetValue, totalValue, value }: IndicatorChipProps) {
	let status: 'negative' | 'positive' | 'warning';
	const delta = (value / totalValue) * 100;
	const label = `${Math.abs(delta).toFixed(1)}%`;

	if (targetRange) {
		const [min, max] = targetRange;

		const isInverted = goal === 'decrease';
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
	else if (targetValue !== undefined) {
		const meetsTarget = delta >= targetValue;
		status = meetsTarget ? 'positive' : 'negative';
	}

	return (
		<Tooltip label={`Em relação ao objetivo de ${targetRange ? `${targetRange[0]}% - ${targetRange[1]}%` : `${targetValue}%`}`}>
			<div className={`${styles.container} ${styles[status]}`}>
				<StatusCircle status={status} />
				<span className={styles.label}>{label}</span>
			</div>
		</Tooltip>
	);
}
