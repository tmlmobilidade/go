'use client';

/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

	const { t } = useTranslation();

	const [timestampLabel, setTimestampLabel] = useState(t('default:TimestampDisplay.updating'));

	//
	// B. Transform data

	useEffect(() => {
		if (!timestamp) return;
		const updateTimestamp = () => {
			const now = Dates.now('Europe/Lisbon');
			const diff = now.unix_milliseconds - timestamp;
			// Convert the difference in milliseconds to an object with days, hours, minutes, and seconds
			const initSeconds = Math.floor(diff / 1000);
			const days = Math.floor(initSeconds / (24 * 3600));
			const hours = Math.floor((initSeconds % (24 * 3600)) / 3600);
			const minutes = Math.floor((initSeconds % 3600) / 60);
			const seconds = initSeconds % 60;
			// Days
			if (days === 1) {
				setTimestampLabel(t('default:TimestampDisplay.days.one'));
				return;
			}
			if (days > 1) {
				setTimestampLabel(t('default:TimestampDisplay.days.other', '', { count: days }));
				return;
			}
			// Hours
			if (hours === 1) {
				setTimestampLabel(t('default:TimestampDisplay.hours.one'));
				return;
			}
			if (hours > 1) {
				setTimestampLabel(t('default:TimestampDisplay.hours.other', '', { count: hours }));
				return;
			}
			// Minutes
			if (minutes === 1) {
				setTimestampLabel(t('default:TimestampDisplay.minutes.one'));
				return;
			}
			if (minutes > 1) {
				setTimestampLabel(t('default:TimestampDisplay.minutes.other', '', { count: minutes }));
				return;
			}
			// Seconds
			if (seconds === 1) {
				setTimestampLabel(t('default:TimestampDisplay.seconds.one'));
				return;
			}
			if (seconds > 1) {
				setTimestampLabel(t('default:TimestampDisplay.seconds.other', '', { count: seconds }));
				return;
			}
		};
		updateTimestamp();
		const interval = setInterval(updateTimestamp, 1000);
		return () => clearInterval(interval);
	}, [t, timestamp]);

	//
	// C. Render components

	if (!timestamp) return <></>;

	return <p className={styles.container}>{timestampLabel}</p>;

	//
}
