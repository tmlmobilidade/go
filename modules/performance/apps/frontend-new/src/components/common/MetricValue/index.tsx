'use client';

/* * */

import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { RollingNumber } from '@tmlmobilidade/ui';

/* * */

export interface MetricRollingValue {
	decimalScale?: number
	fixedDecimalScale?: boolean
	prefix?: string
	suffix?: string
	value: number
}

interface MetricValueProps {
	className?: string
	value: MetricRollingValue | string
}

/* * */

export function createCompactMetricValue(value: number, suffix = ''): MetricRollingValue {
	const absoluteValue = Math.abs(value);
	const divisor = absoluteValue >= 1_000_000 ? 1_000_000 : absoluteValue >= 1_000 ? 1_000 : 1;
	const compactSuffix = divisor === 1_000_000 ? ' M' : divisor === 1_000 ? ' mil' : '';
	const scaledValue = value / divisor;

	return {
		decimalScale: divisor > 1 || !Number.isInteger(scaledValue) ? 1 : 0,
		suffix: `${compactSuffix}${suffix}`,
		value: scaledValue,
	};
}

/* * */

export function MetricValue({ className, value }: MetricValueProps) {
	const formatters = usePerformanceFormatters();

	if (typeof value === 'string') return <strong className={className}>{value}</strong>;

	return (
		<RollingNumber
			animationDuration={650}
			className={className}
			decimalScale={value.decimalScale}
			decimalSeparator={formatters.separators.decimal}
			fixedDecimalScale={value.fixedDecimalScale}
			prefix={value.prefix}
			suffix={value.suffix}
			thousandSeparator={formatters.separators.group}
			timingFunction="cubic-bezier(0.22, 1, 0.36, 1)"
			value={value.value}
		/>
	);
}
