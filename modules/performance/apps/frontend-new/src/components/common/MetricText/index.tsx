'use client';

/* * */

import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { formatPerformanceValue, type PerformanceValueFormat } from '@/utils/performance-formatters';

/* * */

type MetricTextElement = 'dd' | 'small' | 'span' | 'strong';

export interface MetricTextProps {
	as?: MetricTextElement
	className?: string
	format: PerformanceValueFormat
	signed?: boolean
	suffix?: string
	value: null | number | undefined
}

/* * */

export function MetricText({ as = 'span', className, format, signed = false, suffix, value }: MetricTextProps) {
	const formatters = usePerformanceFormatters();
	const Component = as;
	const label = value === null || value === undefined
		? '—'
		: formatPerformanceValue(value, format, formatters, { signed, suffix });

	return <Component className={className}>{label}</Component>;
}
