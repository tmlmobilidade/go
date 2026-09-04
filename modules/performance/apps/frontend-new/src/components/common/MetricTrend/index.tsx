'use client';

/* * */

import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { getMetricTrendDirection, getMetricTrendSentiment } from '@/utils/metric-trend';
import { formatPerformanceValue, type PerformanceNumberFormat } from '@/utils/performance-formatters';
import { IconArrowDownRight, IconArrowRight, IconArrowUpRight } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export type { MetricTrendDirection, MetricTrendSentiment } from '@/utils/metric-trend';

export type MetricTrendFormat = Extract<PerformanceNumberFormat, 'compact' | 'percentage' | 'percentage-points'>;

export interface MetricTrendProps {
	className?: string
	comparisonLabel?: string
	format: MetricTrendFormat
	positiveWhenIncreasing?: boolean
	size?: 'md' | 'sm'
	value: null | number | undefined
}

/* * */

export function MetricTrend({ className, comparisonLabel, format, positiveWhenIncreasing = true, size = 'md', value }: MetricTrendProps) {
	const formatters = usePerformanceFormatters();

	if (value === null || value === undefined) return null;

	const direction = getMetricTrendDirection(value);
	const sentiment = getMetricTrendSentiment(value, positiveWhenIncreasing);
	const label = formatPerformanceValue(value, format, formatters, { signed: true });
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
