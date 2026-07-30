'use client';

/* * */

import { Dates } from '@tmlmobilidade/dates';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	timestamp?: number
}

/* * */

export function MetricTimestamp({ timestamp }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [timestampLabel, setTimestampLabel] = useState(t('default:videowall.timestamp.updating'));

	//
	// B. Transform data

	useEffect(() => {
		if (!timestamp) return;

		const updateTimestamp = () => {
			const diffInSeconds = Math.max(0, Math.floor((Dates.now('Europe/Lisbon').unix_timestamp - timestamp) / 1000));
			const days = Math.floor(diffInSeconds / 86_400);
			const hours = Math.floor(diffInSeconds % 86_400 / 3_600);
			const minutes = Math.floor(diffInSeconds % 3_600 / 60);
			const seconds = diffInSeconds % 60;

			if (days > 0) {
				setTimestampLabel(t('default:videowall.timestamp.days', '', { count: days }));
				return;
			}

			if (hours > 0) {
				setTimestampLabel(t('default:videowall.timestamp.hours', '', { count: hours }));
				return;
			}

			if (minutes > 0) {
				setTimestampLabel(t('default:videowall.timestamp.minutes', '', { count: minutes }));
				return;
			}

			setTimestampLabel(t('default:videowall.timestamp.seconds', '', { count: seconds }));
		};

		updateTimestamp();
		const interval = window.setInterval(updateTimestamp, 1_000);

		return () => window.clearInterval(interval);
	}, [t, timestamp]);

	//
	// B. Render components

	if (!timestamp) return null;

	return <p className={styles.container}>{timestampLabel}</p>;

	//
}
