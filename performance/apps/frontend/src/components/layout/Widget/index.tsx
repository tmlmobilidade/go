'use client';

/* * */

import { VisualizationContainer } from '@/components/layout/VisualizationContainer';
import { IconCloud } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/utils';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

// TODO: Implement weather API integration

export function Widget() {
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
		<VisualizationContainer>
			<div className={styles.container}>
				<div className={styles.weatherContainer}>
					<IconCloud />
					<p className={styles.weatherLabel}>23ºC</p>
				</div>
				<div className={styles.timeContainer}>
					<p className={styles.hours}>{hours}</p>
					<p className={styles.minutes}>{minutes}</p>
					<p className={styles.seconds}>{seconds}</p>
				</div>
			</div>
		</VisualizationContainer>
	);
}
