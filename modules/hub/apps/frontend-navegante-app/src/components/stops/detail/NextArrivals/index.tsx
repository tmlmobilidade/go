'use client';

import { LiveIcon } from '@/components/common/display/LiveIcon';
import { IconAlertCircleFilled, IconClockHour9 } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface NextArrival {
	estimated_arrival_hours: number
	estimated_arrival_minutes: number
	estimated_arrival_seconds: number
	estimated_arrival_unix: number
	label: string
}

interface Props {
	allowPastArrivals?: boolean
	arrivals: number[]
	scheduledArrivals?: number[]
	status: 'canceled' | 'passed' | 'realtime' | 'scheduled'
	tripId?: string
	withIcon?: boolean
}

/* * */

const LIVE_ETA_COLOR = 'var(--color-status-success-primary)';

/* * */

export function NextArrivals({ allowPastArrivals = true, arrivals, scheduledArrivals, status, withIcon = true }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [allFormattedArrivals, setFormattedArrivals] = useState<NextArrival[]>([]);

	//
	// B. Transform data

	useEffect(() => {
		//

		const formatArrivals = () => {
			//
			const nowInSeconds = Dates.now('Europe/Lisbon').unix_timestamp / 1000;
			const allFormattedArrivalsResult: NextArrival[] = [];
			//
			for (const unixTimestamp of arrivals) {
				// Check if arrival is in the past
				if (!allowPastArrivals && unixTimestamp < nowInSeconds) continue;
				// Prepare the time values
				const secondsUntilArrival = Math.floor(unixTimestamp - nowInSeconds);
				const minutesUntilArrival = Math.floor(secondsUntilArrival / 60);
				const hoursUntilArrival = Math.floor(minutesUntilArrival / 60);

				// Live ETA — relative time (ex: "5 min", "1 hora")
				if (status === 'realtime') {
				//
					let labelResult = '';
					//
					if (minutesUntilArrival <= 0) {
						labelResult = t('default:stops.NextArrivals.arriving');
					}
					if (hoursUntilArrival > 0) {
						labelResult += `${hoursUntilArrival} ${t('default:stops.NextArrivals.hours')} `;
					}
					if (minutesUntilArrival > 0) {
						labelResult += `${minutesUntilArrival % 60} ${t('default:stops.NextArrivals.minutes')}`;
					}
					//
					allFormattedArrivalsResult.push({
						estimated_arrival_hours: hoursUntilArrival,
						estimated_arrival_minutes: minutesUntilArrival,
						estimated_arrival_seconds: secondsUntilArrival,
						estimated_arrival_unix: unixTimestamp,
						label: labelResult.trim(),
					});
				}

				// Scheduled — absolute HH:mm
				if (status === 'scheduled' || status === 'passed' || status === 'canceled') {
					allFormattedArrivalsResult.push({
						estimated_arrival_hours: hoursUntilArrival,
						estimated_arrival_minutes: minutesUntilArrival,
						estimated_arrival_seconds: secondsUntilArrival,
						estimated_arrival_unix: unixTimestamp,
						label: Dates.fromUnixTimestamp(unixTimestamp).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm'),
					});
				}
			}

			setFormattedArrivals(allFormattedArrivalsResult);

			//
		};

		formatArrivals();

		const interval = setInterval(formatArrivals, 1000);

		return () => clearInterval(interval);

		//
	}, [allowPastArrivals, arrivals, status, t]);

	//
	// C. Render components

	if (!allFormattedArrivals || allFormattedArrivals.length === 0) {
		return null;
	}

	if (status === 'realtime') {
		return (
			<div className={`${styles.container} ${styles.realtime} ${scheduledArrivals?.length ? styles.withScheduled : ''}`}>
				<div className={styles.primary}>
					{withIcon && (
						<div className={styles.icon}>
							<LiveIcon color={LIVE_ETA_COLOR} />
						</div>
					)}
					<div className={styles.list}>
						{allFormattedArrivals.map(formattedArrival => (
							<p key={formattedArrival.estimated_arrival_unix} className={styles.arrival}>
								{formattedArrival.label}
							</p>
						))}
					</div>
				</div>
				{scheduledArrivals?.map(unix => (
					<p key={unix} className={styles.scheduledSecondary}>
						{Dates.fromUnixTimestamp(unix).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm')}
					</p>
				))}
			</div>
		);
	}

	if (status === 'scheduled') {
		return (
			<div className={`${styles.container} ${styles.scheduled}`}>
				{withIcon && (
					<div className={styles.icon}>
						<IconClockHour9 />
					</div>
				)}
				<div className={styles.list}>
					{allFormattedArrivals.map(formattedArrival => (
						<p key={formattedArrival.estimated_arrival_unix} className={styles.arrival}>
							{formattedArrival.label}
						</p>
					))}
				</div>
			</div>
		);
	}

	if (status === 'passed') {
		return (
			<div className={`${styles.container} ${styles.passed}`}>
				<div className={styles.list}>
					{allFormattedArrivals.map(formattedArrival => (
						<p key={formattedArrival.estimated_arrival_unix} className={styles.arrival}>
							{formattedArrival.label}
						</p>
					))}
				</div>
			</div>
		);
	}

	if (status === 'canceled') {
		return (
			<div className={`${styles.container} ${styles.canceled}`}>
				{withIcon && (
					<div className={styles.icon}>
						<IconAlertCircleFilled />
					</div>
				)}
				<div className={styles.list}>
					{allFormattedArrivals.map(formattedArrival => (
						<p key={formattedArrival.estimated_arrival_unix} className={styles.arrival}>
							{formattedArrival.label}
						</p>
					))}
				</div>
			</div>
		);
	}

	//
}
