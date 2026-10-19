'use client';

import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export function Background3() {
	//

	//
	// A. Setup variables

	const [timeString, setTimeString] = useState('');

	//
	// B. Transform data

	const buildTimeString = () => {
		const string = new Date().toLocaleTimeString('pt-PT', {
			day: '2-digit',
			hour: '2-digit',
			hour12: false,
			minute: '2-digit',
			month: '2-digit',
			second: '2-digit',
			year: 'numeric',
		});
		setTimeString(string);
	};

	useEffect(() => {
		buildTimeString();
		const interval = setInterval(() => {
			buildTimeString();
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<div className={styles.scanlines} />
			<div className={styles.introWrap}>
				<div className={styles.noise} />
				<div className={`${styles.noise} ${styles.noiseMoving}`} />

				<div className={styles.play} data-splitting>GO V2</div>
				<div className={styles.time}>RESTRICTED ACCESS</div>
				<div className={styles.recordSpeed}>{timeString}</div>
			</div>
		</div>
	);

	//
};
