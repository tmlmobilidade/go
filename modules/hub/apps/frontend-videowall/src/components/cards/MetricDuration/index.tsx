'use client';

/* * */

import { MetricNumber } from '@/components/common/MetricNumber';

import styles from './styles.module.css';

/* * */

interface Props {
	value: null | number | undefined
}

/* * */

export function MetricDuration({ value }: Props) {
	//

	//
	// A. Setup variables

	const totalSeconds = value === null || value === undefined
		? null
		: Math.round(value * 60);
	const minutes = totalSeconds === null ? null : Math.floor(totalSeconds / 60);
	const seconds = totalSeconds === null ? null : totalSeconds % 60;

	//
	// F. Render components

	if (totalSeconds === null) {
		return '—';
	}

	return (
		<div className={styles.container}>
			<MetricNumber suffix="m" value={minutes} />
			<MetricNumber suffix="s" value={seconds} />
		</div>
	);

	//
}
