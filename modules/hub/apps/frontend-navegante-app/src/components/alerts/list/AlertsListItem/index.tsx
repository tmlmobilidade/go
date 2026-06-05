'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { AlertEffectIcon } from '@/components/alerts/common/AlertEffectIcon';
import { AlertsListItemImageThumbnail } from '@/components/alerts/list/AlertsListItemImageThumbnail';
import { Accordion } from '@mantine/core';

import styles from './styles.module.css';

/* * */

interface AlertListItemProps {
	alertId: string
}

/* * */

export function AlertListItem({ alertId }: AlertListItemProps) {
	//

	//
	// A. Setup variables

	const alertsContext = useAlertsContext();

	//
	// B. Transform data

	const resolvedAlert = alertsContext.actions.getAlertById(alertId);

	//
	// C. Render components

	return (
		<Accordion.Item value={alertId}>
			<Accordion.Control classNames={{ control: styles.item }} icon={<AlertEffectIcon effect={resolvedAlert?.effect} />}>
				{resolvedAlert?.title}
			</Accordion.Control>
			<Accordion.Panel classNames={{ content: styles.contentWrapper }}>
				<div className={styles.infoBar}>
					{resolvedAlert?.active_period_start_date && <AlertActivePeriodStart date={resolvedAlert.active_period_start_date} size="sm" />}
				</div>
				<p className={styles.description}>{resolvedAlert?.description}</p>
				{resolvedAlert?.image_url && (
					<AlertsListItemImageThumbnail alt={resolvedAlert?.title}src={resolvedAlert?.image_url} />
				)}
			</Accordion.Panel>
		</Accordion.Item>
	);

	//
}
