'use client';

/* * */

import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { type PerformanceNumberFormat } from '@/utils/performance-formatters';
import { RollingNumber } from '@tmlmobilidade/ui';

/* * */

interface MetricRollingValue {
	decimalScale?: number
	fixedDecimalScale?: boolean
	suffix?: string
	value: number
}

export type MetricValueFormat = 'text' | Extract<PerformanceNumberFormat, 'compact' | 'decimal' | 'integer' | 'percentage'>;

export interface MetricValueProps {
	className?: string
	format: MetricValueFormat
	suffix?: string
	value: null | number | string | undefined
}

/* * */

function createMetricRollingValue(value: number, format: Exclude<MetricValueFormat, 'text'>, suffix = ''): MetricRollingValue {
	if (format === 'decimal') {
		return { decimalScale: 1, fixedDecimalScale: true, suffix, value };
	}

	if (format === 'integer') {
		return { decimalScale: 0, suffix, value };
	}

	if (format === 'percentage') {
		return { decimalScale: 1, fixedDecimalScale: true, suffix: `%${suffix}`, value };
	}

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

export function MetricValue({ className, format, suffix, value }: MetricValueProps) {
	const formatters = usePerformanceFormatters();

	if (value === null || value === undefined) return <strong className={className}>—</strong>;
	if (format === 'text' || typeof value === 'string') return <strong className={className}>{value}</strong>;

	const rollingValue = createMetricRollingValue(value, format, suffix);

	return (
		<RollingNumber
			animationDuration={650}
			className={className}
			decimalScale={rollingValue.decimalScale}
			decimalSeparator={formatters.separators.decimal}
			fixedDecimalScale={rollingValue.fixedDecimalScale}
			suffix={rollingValue.suffix}
			thousandSeparator={formatters.separators.group}
			timingFunction="cubic-bezier(0.22, 1, 0.36, 1)"
			value={rollingValue.value}
		/>
	);
}
