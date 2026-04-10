'use client';
/* * */

import type { Alert } from '@tmlmobilidade/types';

import { AlertsPublicListCard } from '@/components/list/AlertsPublicListCard';
import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { keepUrlParams, Section, Surface } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export default function AlertsPublicList() {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation();
	const alertsPublicListContext = useAlertsPublicListContext();
	const todayDateKey = useMemo(() => Dates.now('Europe/Lisbon').startOf('day').toFormat('yyyyMMdd'), []);
	const tomorrowDateKey = useMemo(() => Dates.now('Europe/Lisbon').plus({ days: 1 }).startOf('day').toFormat('yyyyMMdd'), []);
	const yesterdayDateKey = useMemo(() => Dates.now('Europe/Lisbon').minus({ days: 1 }).startOf('day').toFormat('yyyyMMdd'), []);

	//
	// B. Transform Data

	const groupedAlerts = useMemo(() => {
		const alertsMap = new Map<number, Alert[]>();

		for (const alert of alertsPublicListContext.data.filtered) {
			const dayTimestamp = Dates.fromUnixTimestamp(alert.active_period_start_date).setZone('Europe/Lisbon', 'offset_only').startOf('day').unix_timestamp;
			const currentGroup = alertsMap.get(dayTimestamp) ?? [];
			currentGroup.push(alert);
			alertsMap.set(dayTimestamp, currentGroup);
		}

		return [...alertsMap.entries()].sort((a, b) => b[0] - a[0]).map(([dayTimestamp, alerts]) => ({ alerts, dayTimestamp }));
	}, [alertsPublicListContext.data.filtered]);

	const getGroupDateLabel = (dayTimestamp: number) => {
		const dayDate = Dates.fromUnixTimestamp(dayTimestamp).setZone('Europe/Lisbon', 'offset_only');
		const dateLabel = dayDate.toFormat('d LLLL yyyy', { locale: 'pt' });
		const dayDateKey = dayDate.toFormat('yyyyMMdd');

		if (dayDateKey === todayDateKey) return `A partir de hoje, ${dateLabel}`;
		if (dayDateKey === tomorrowDateKey) return `A partir de amanha, ${dateLabel}`;
		if (dayDateKey === yesterdayDateKey) return `Desde ontem, ${dateLabel}`;
		if (dayDateKey < todayDateKey) return `Desde ${dateLabel}`;
		return `A partir de ${dateLabel}`;
	};

	//
	// C. Render Components

	return (
		<Surface>
			<Section>
				<div className={styles.groups}>
					{groupedAlerts.map(group => (
						<section key={group.dayTimestamp} className={styles.group}>
							<header className={styles.groupHeader}>
								<p className={styles.groupLabel}>
									{group.alerts.length > 1 ? t('default:alerts.public.list.groups.label_plural') : t('default:alerts.public.list.groups.label_single')}
								</p>
								<p className={styles.groupDate}>{getGroupDateLabel(group.dayTimestamp)}</p>
							</header>
							<div className={styles.groupCards}>
								{group.alerts.map(alert => (
									<Link key={alert._id} className={styles.cardLink} href={keepUrlParams(PAGE_ROUTES.alerts.HOME_DETAIL(alert._id))}>
										<AlertsPublicListCard alert={alert} description={alert.description} title={alert.title} />
									</Link>
								))}
							</div>
						</section>
					))}
				</div>
			</Section>
		</Surface>
	);

	//
}
