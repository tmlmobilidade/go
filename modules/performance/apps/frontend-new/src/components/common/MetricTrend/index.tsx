/* * */

import { IconArrowDownRight, IconArrowRight, IconArrowUpRight } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export type MetricTrendDirection = 'down' | 'flat' | 'up';
export type MetricTrendSentiment = 'negative' | 'neutral' | 'positive' | 'warning';

interface MetricTrendProps {
	className?: string
	comparisonLabel?: string
	direction: MetricTrendDirection
	label: string
	sentiment: MetricTrendSentiment
	size?: 'md' | 'sm'
}

/* * */

export function MetricTrend({ className, comparisonLabel, direction, label, sentiment, size = 'md' }: MetricTrendProps) {
	const TrendIcon = direction === 'up' ? IconArrowUpRight : direction === 'down' ? IconArrowDownRight : IconArrowRight;
	const iconSize = size === 'sm' ? 14 : 16;
	const rootClassName = className ? `${styles.root} ${className}` : styles.root;

	return (
		<span className={rootClassName} data-sentiment={sentiment} data-size={size}>
			<TrendIcon aria-hidden="true" size={iconSize} stroke={2.2} />
			<strong>{label}</strong>
			{comparisonLabel && <span className={styles.comparison}>{comparisonLabel}</span>}
		</span>
	);
}
