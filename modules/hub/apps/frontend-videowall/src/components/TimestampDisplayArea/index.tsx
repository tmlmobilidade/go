/* * */

import { Dates } from '@tmlmobilidade/dates';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	timestamp?: number
}

/* * */

export function TimestampDisplayArea({ timestamp = 0 }: Props) {
	//

	//
	// A. Setup variables

	const [timestampLabel, setTimestampLabel] = useState('Em atualização...');

	//
	// B. Transform data

	useEffect(() => {
		if (!timestamp) return;
		const updateTimestamp = () => {
			const now = Dates.now('Europe/Lisbon');
			const diff = now.unix_timestamp - timestamp;
			// Convert the difference in milliseconds to an object with days, hours, minutes, and seconds
			const initSeconds = Math.floor(diff / 1000);
			const days = Math.floor(initSeconds / (24 * 3600));
			const hours = Math.floor((initSeconds % (24 * 3600)) / 3600);
			const minutes = Math.floor((initSeconds % 3600) / 60);
			const seconds = initSeconds % 60;
			// Days
			if (days === 1) {
				setTimestampLabel('Atualizado há 1 dia');
				return;
			}
			if (days > 1) {
				setTimestampLabel(`Atualizado há ${days} dia`);
				return;
			}
			// Hours
			if (hours === 1) {
				setTimestampLabel('Atualizado há 1 hora');
				return;
			}
			if (hours > 1) {
				setTimestampLabel(`Atualizado há ${hours} horas`);
				return;
			}
			// Minutes
			if (minutes === 1) {
				setTimestampLabel('Atualizado há 1 minuto');
				return;
			}
			if (minutes > 1) {
				setTimestampLabel(`Atualizado há ${minutes} minutos`);
				return;
			}
			// Seoncs
			if (seconds === 1) {
				setTimestampLabel('Atualizado há 1 segundo');
				return;
			}
			if (seconds > 1) {
				setTimestampLabel(`Atualizado há ${seconds} segundos`);
				return;
			}
		};
		updateTimestamp();
		const interval = setInterval(updateTimestamp, 1000);
		return () => clearInterval(interval);
	}, [timestamp]);

	//
	// C. Render components

	if (!timestamp) return <></>;

	return <p className={styles.container}>{timestampLabel}</p>;

	//
}
