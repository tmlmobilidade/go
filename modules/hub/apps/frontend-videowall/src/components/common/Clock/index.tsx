'use client';

/* * */

import { type MetricCardSize } from '@/components/cards/MetricCard';
import { Dates } from '@tmlmobilidade/dates';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	size: MetricCardSize
}

/* * */

export function Clock({ size }: Props) {
	//

	//
	// A. Setup variables

	const [hours, setHours] = useState<string>('--');
	const [minutes, setMinutes] = useState<string>('--');
	const [seconds, setSeconds] = useState<string>('--');

	//
	// B. Transform data

	const updateTime = () => {
		const now = Dates.now('Europe/Lisbon');
		setHours(now.toFormat('HH'));
		setMinutes(now.toFormat(':mm'));
		setSeconds(now.toFormat('ss'));
	};

	useEffect(() => {
		updateTime();
		const timer = setInterval(updateTime, 1000);
		return () => clearInterval(timer);
	}, []);

	//
	// C. Render components

	return (
		<div className={styles.container} data-size={size}>
			<p className={styles.hours}>{hours}</p>
			<p className={styles.minutes}>{minutes}</p>
			<p className={styles.seconds}>{seconds}</p>
		</div>
	);

	//
}
