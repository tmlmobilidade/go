'use client';

import { AlertActivePeriodEnd, AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { AlertEffectIcon } from '@/components/alerts/common/AlertCauseEffectIcon';
import AlertsListItemImageThumbnail from '@/components/alerts/list/AlertsListItemImageThumbnail';
import { useAlertsContext } from '@/contexts/Alerts.context';
import { Accordion } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	alertId: string
}

/* * */

export function AlertListItem({ alertId }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertsContext = useAlertsContext();

	//
	// B. Transform data

	const resolvedAlert = alertsContext.actions.getAlertById(alertId);

	// const view = useMemo(() => {
	// 	if (!resolvedAlert) return null;
	// 	return {
	// 		description: resolvedAlert.description,
	// 		endDate: resolvedAlert.end_date,
	// 		imageUrl: resolvedAlert.image_url,
	// 		startDate: resolvedAlert.start_date,
	// 		title: resolvedAlert.title,
	// 	};
	// }, [resolvedAlert]);

	// const alertHref = environmentContext.actions.getNormalizedHref(`/alerts/${alertId}`);

	//
	// C. Render components

	return (
		<Accordion.Item value={alertId}>
			{/* <Accordion.Control icon={<AlertEffectIcon effect={resolvedAlert?.effect} />}>{view?.title}</Accordion.Control>
			<Accordion.Panel classNames={{ content: styles.contentWrapper }}>
				<div className={styles.infoBar}>
					{view?.startDate && <AlertActivePeriodStart date={view.startDate} size="sm" />}
					<AlertActivePeriodEnd date={view?.endDate} size="sm" />
				</div>
				<p className={styles.description}>{view?.description}</p>
				{view?.imageUrl && (
					<AlertsListItemImageThumbnail
						alertId={resolvedAlert?.alert_id || ''}
						alertTitle={view.title}
						alt={view.title}
						href={`/alerts/${alertId}`}
						src={view.imageUrl}
					/>
				)}
				<div>
					<Button href={alertHref} icon={<IconArrowUpRight size={16} />} label={t('open')} variant="pill" />
				</div>
			</Accordion.Panel> */}
		</Accordion.Item>
	);

	//
}
