'use client';
/* * */

import type { Alert } from '@tmlmobilidade/types';

import { AlertsPublicListCard } from '@/components/alerts/list/AlertsPublicListCard';
import { useAlertsListContext } from '@/contexts/AlertsList.context';
import { Dates } from '@tmlmobilidade/dates';
import { keepUrlParams, Section, Surface } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { AlertsPublicListSkeleton } from '../AlertsPublicListSkeleton';

/* * */

export default function AlertsPublicList() {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation();
	const alertsListContext = useAlertsListContext();
	const todayDateKey = useMemo(() => Dates.now('Europe/Lisbon').startOf('day').toFormat('yyyyMMdd'), []);
	const tomorrowDateKey = useMemo(() => Dates.now('Europe/Lisbon').plus({ days: 1 }).startOf('day').toFormat('yyyyMMdd'), []);
	const yesterdayDateKey = useMemo(() => Dates.now('Europe/Lisbon').minus({ days: 1 }).startOf('day').toFormat('yyyyMMdd'), []);

	//
	// B. Transform Data

	const groupedAlerts = useMemo(() => {
		const alertsMap = new Map<number, Alert[]>();

		for (const alert of alertsListContext.data.filtered) {
			const dayTimestamp = Dates.fromUnixTimestamp(alert.active_period_start_date).setZone('Europe/Lisbon', 'offset_only').startOf('day').unix_timestamp;
			const currentGroup = alertsMap.get(dayTimestamp) ?? [];
			currentGroup.push(alert);
			alertsMap.set(dayTimestamp, currentGroup);
		}

		return [...alertsMap.entries()].sort((a, b) => b[0] - a[0]).map(([dayTimestamp, alerts]) => ({ alerts, dayTimestamp }));
	}, [alertsListContext.data.filtered]);

	const getGroupDateLabel = (dayTimestamp: number) => {
		const dayDate = Dates.fromUnixTimestamp(dayTimestamp).setZone('Europe/Lisbon', 'offset_only');
		const dateLabel = dayDate.toFormat('d LLLL yyyy', { locale: 'pt' });
		const dayDateKey = dayDate.toFormat('yyyyMMdd');

		if (dayDateKey === todayDateKey) return String(t('shared:home.alerts.public.list.groups.from_today')).replace('{date}', dateLabel);
		if (dayDateKey === tomorrowDateKey) return String(t('shared:home.alerts.public.list.groups.from_tomorrow')).replace('{date}', dateLabel);
		if (dayDateKey === yesterdayDateKey) return String(t('shared:home.alerts.public.list.groups.since_yesterday')).replace('{date}', dateLabel);
		if (dayDateKey < todayDateKey) return String(t('shared:home.alerts.public.list.groups.since_date')).replace('{date}', dateLabel);
		return String(t('shared:home.alerts.public.list.groups.from_date')).replace('{date}', dateLabel);
	};

	//
	// C. Render Components

	if (alertsListContext.flags.loading) {
		return <AlertsPublicListSkeleton />;
	}

	return (

		<Section>
			<div className={styles.groups}>
				{groupedAlerts.map(group => (
					<section key={group.dayTimestamp} className={styles.group}>
						<div className={styles.groupBox}>
							<header className={styles.groupHeader}>
								<p className={styles.groupLabel}>
									{group.alerts.length > 1 ? t('shared:home.alerts.public.list.groups.label_plural') : t('shared:home.alerts.public.list.groups.label_single')}
								</p>
								<p className={styles.groupDate}>{getGroupDateLabel(group.dayTimestamp)}</p>
							</header>
							<div className={styles.groupCards}>
								{group.alerts.map(alert => (
									<Link key={alert._id} className={styles.cardLink} href={keepUrlParams(`/alerts/${alert._id}`)}>
										<AlertsPublicListCard alert={alert} description={alert.description} title={alert.title} />
									</Link>
								))}
							</div>
						</div>
					</section>
				))}
			</div>
		</Section>

	);

	//
}
