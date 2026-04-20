/* * */

import type { ReactElement } from 'react';

import { getAlertCardSeverityLevel } from '@/lib/alert-severity';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert } from '@tmlmobilidade/types';
import { AlertCauseIcons, AlertEffectIcons } from '@tmlmobilidade/ui';
import { cloneElement, isValidElement } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AlertsPublicListCardProps {
	alert: Alert
	description?: string
	title?: string
}

/* * */

const AlertsPublicListCardIcon = ({ alert }: { alert: Alert }) => {
	const template = AlertEffectIcons[alert.effect] ?? AlertCauseIcons[alert.cause];
	if (!isValidElement(template)) return template;
	return cloneElement(template as ReactElement<{ className?: string, size?: number, stroke?: number }>, {
		className: styles.cardIcon,
		size: 22,
		stroke: 2,
	});
};

/* * */

export function AlertsPublicListCard({ alert, description, title }: AlertsPublicListCardProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const severity = getAlertCardSeverityLevel(alert.cause, alert.effect);
	const startDate = Dates.fromUnixTimestamp(alert.active_period_start_date).setZone('Europe/Lisbon', 'offset_only').toFormat('dd/MM/yyyy HH:mm');
	const endDate = alert.active_period_end_date ? Dates.fromUnixTimestamp(alert.active_period_end_date).setZone('Europe/Lisbon', 'offset_only').toFormat('dd/MM/yyyy HH:mm') : t('shared:base.alerts.public.list.card.dates.no_end');

	//
	// B. Render components

	return (
		<article className={styles.card} data-severity={severity}>
			<div className={styles.header}>
				<span aria-hidden="true" className={styles.iconWrap} data-severity={severity}>
					<AlertsPublicListCardIcon alert={alert} />
				</span>
				<div className={styles.main}>
					{title && <h3 className={styles.title}>{title}</h3>}
					{description && <p className={styles.description}>{description}</p>}
				</div>
			</div>
			<div className={styles.dates}>
				<div className={styles.dateRow}>
					<span className={styles.dateLabel}>{t('shared:base.alerts.public.list.card.dates.start')}</span>
					<span className={styles.dateValue}>{startDate}</span>
				</div>
				<div className={styles.dateRow}>
					<span className={styles.dateLabel}>{t('shared:base.alerts.public.list.card.dates.end')}</span>
					<span className={styles.dateValue}>{endDate}</span>
				</div>
			</div>
		</article>
	);

	//
}
