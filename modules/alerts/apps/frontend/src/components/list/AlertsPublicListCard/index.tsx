/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type Alert } from '@tmlmobilidade/types';
import styles from './styles.module.css';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface AlertsPublicListCardProps {
	alert: Alert
	description?: string
	title?: string
}

/* * */

export function AlertsPublicListCard({ alert, description, title }: AlertsPublicListCardProps) {
	const { t } = useTranslation();

	const activePeriodDates = useMemo(() => {
		const startDate = Dates
			.fromUnixTimestamp(alert.active_period_start_date)
			.setZone('Europe/Lisbon', 'offset_only')
			.toFormat('dd/MM/yyyy HH:mm');
		const endDate = alert.active_period_end_date
			? Dates
				.fromUnixTimestamp(alert.active_period_end_date)
				.setZone('Europe/Lisbon', 'offset_only')
				.toFormat('dd/MM/yyyy HH:mm')
			: t('default:alerts.public.list.card.dates.no_end');
		return { endDate, startDate };
	}, [alert.active_period_end_date, alert.active_period_start_date]);

	return (
		<article className={styles.card}>
			{title && <h3 className={styles.title}>{title}</h3>}
			{description && <p className={styles.description}>{description}</p>}
			<div className={styles.dates}>
				<div className={styles.dateRow}>
					<span className={styles.dateLabel}>{t('default:alerts.public.list.card.dates.start')}</span>
					<span className={styles.dateValue}>{activePeriodDates.startDate}</span>
				</div>
				<div className={styles.dateRow}>
					<span className={styles.dateLabel}>{t('default:alerts.public.list.card.dates.end')}</span>
					<span className={styles.dateValue}>{activePeriodDates.endDate}</span>
				</div>
			</div>
		</article>
	);
}
