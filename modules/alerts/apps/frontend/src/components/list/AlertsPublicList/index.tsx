'use client';

/* * */

import { AlertsPublicListCard } from '@/components/list/AlertsPublicListCard';
import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { Dates } from '@tmlmobilidade/dates';
import { Section, Surface } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export default function AlertsPublicList() {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation();
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const alertsPublicListContext = useAlertsPublicListContext();
	const [visibleCount, setVisibleCount] = useState(20);
	const todayDateKey = useMemo(() => Dates.now('Europe/Lisbon').startOf('day').toFormat('yyyyMMdd'), []);
	const tomorrowDateKey = useMemo(() => Dates.now('Europe/Lisbon').plus({ days: 1 }).startOf('day').toFormat('yyyyMMdd'), []);
	const yesterdayDateKey = useMemo(() => Dates.now('Europe/Lisbon').minus({ days: 1 }).startOf('day').toFormat('yyyyMMdd'), []);

	//
	// B. Transform Data

	const visibleAlerts = alertsPublicListContext.data.filtered.slice(0, visibleCount);
	const groupedAlerts = useMemo(() => {
		const alertsMap = new Map<number, typeof visibleAlerts>();

		for (const alert of visibleAlerts) {
			const dayTimestamp = Dates
				.fromUnixTimestamp(alert.active_period_start_date)
				.setZone('Europe/Lisbon', 'offset_only')
				.startOf('day')
				.unix_timestamp;
			const currentGroup = alertsMap.get(dayTimestamp) ?? [];
			currentGroup.push(alert);
			alertsMap.set(dayTimestamp, currentGroup);
		}

		return [...alertsMap.entries()]
			.sort((a, b) => b[0] - a[0])
			.map(([dayTimestamp, alerts]) => ({ alerts, dayTimestamp }));
	}, [visibleAlerts]);

	const getGroupDateLabel = (dayTimestamp: number) => {
		const dayDate = Dates
			.fromUnixTimestamp(dayTimestamp)
			.setZone('Europe/Lisbon', 'offset_only');
		const dateLabel = dayDate.toFormat('d LLLL yyyy', { locale: 'pt' });
		const dayDateKey = dayDate.toFormat('yyyyMMdd');

		if (dayDateKey === todayDateKey) return `A partir de hoje, ${dateLabel}`;
		if (dayDateKey === tomorrowDateKey) return `A partir de amanha, ${dateLabel}`;
		if (dayDateKey === yesterdayDateKey) return `Desde ontem, ${dateLabel}`;
		if (dayDateKey < todayDateKey) return `Desde ${dateLabel}`;
		return `A partir de ${dateLabel}`;
	};

	useEffect(() => {
		if (!sentinelRef.current) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setVisibleCount(prev => prev + 20);
			}
		}, { rootMargin: '200px' });
		observer.observe(sentinelRef.current);
		return () => observer.disconnect();
	}, [alertsPublicListContext.data.filtered.length]);

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
									{group.alerts.length > 1
										? t('default:alerts.public.list.groups.label_plural')
										: t('default:alerts.public.list.groups.label_single')}
								</p>
								<p className={styles.groupDate}>{getGroupDateLabel(group.dayTimestamp)}</p>
							</header>
							<div className={styles.groupCards}>
								{group.alerts.map(alert => (
									<AlertsPublicListCard
										key={alert._id}
										alert={alert}
										description={alert.description}
										title={alert.title}
									/>
								))}
							</div>
						</section>
					))}
				</div>
				<div ref={sentinelRef} />
			</Section>
		</Surface>
	);

	//
}
