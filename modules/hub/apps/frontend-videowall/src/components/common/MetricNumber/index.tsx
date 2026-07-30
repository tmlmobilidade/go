'use client';

/* * */

import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';
import { getNumberAnimationDuration } from '@/types/number-animation';
import { RollingNumber } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface Props {
	decimalScale?: number
	fallback?: string
	prefix?: string
	suffix?: string
	value: null | number | undefined
}

/* * */

export function MetricNumber({
	decimalScale = 0,
	fallback = '—',
	prefix,
	suffix,
	value,
}: Props) {
	//

	//
	// A. Setup variables

	const { settings } = useVideowallMetricsContext();
	const animation = settings.number_animation;

	//
	// B. Render components

	if (value === null || value === undefined) {
		return fallback;
	}

	return (
		<RollingNumber
			animationDuration={getNumberAnimationDuration(animation)}
			className={styles.number}
			decimalScale={decimalScale}
			decimalSeparator=","
			prefix={prefix}
			suffix={suffix}
			tabularNumbers={false}
			thousandSeparator=" "
			timingFunction={animation.timing_function}
			value={value}
		/>
	);

	//
}
