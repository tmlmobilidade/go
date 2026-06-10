'use client';

import { Dates } from '@tmlmobilidade/dates';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export function StopsDetailTimetableClock() {
	//

	//
	// A. Setup variables

	const [currentTimeHours, setCurrentTimeHours] = useState('00');
	const [currentTimeMinutes, setCurrentTimeMinutes] = useState('00');
	const [currentTimeSeconds, setCurrentTimeSeconds] = useState('00');

	//
	// B. Transform data

	useEffect(() => {
		const interval = setInterval(() => {
			const currentTime = Dates.now('Europe/Lisbon');
			setCurrentTimeHours(currentTime.toFormat('HH'));
			setCurrentTimeMinutes(currentTime.toFormat('mm'));
			setCurrentTimeSeconds(currentTime.toFormat('ss'));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<div className={styles.circle} />
			<div className={styles.line} />
			<div className={styles.time}>
				{currentTimeHours}
				<span>:</span>
				{currentTimeMinutes}
				<span>:</span>
				{currentTimeSeconds}
			</div>
		</div>
	);

	//
}
