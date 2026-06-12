'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { AlertEffectIcon } from '@/components/alerts/common/AlertEffectIcon';
import { AlertsListItemImageThumbnail } from '@/components/alerts/list/AlertsListItemImageThumbnail';
import { Accordion } from '@mantine/core';
import { MantineHighlight } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface AlertListItemProps {
	alertId: string
	searchQuery?: string
}

/* * */

export function AlertListItem({ alertId, searchQuery }: AlertListItemProps) {
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
				<MantineHighlight component="span" highlight={searchQuery || ''}>
					{resolvedAlert?.title || ''}
				</MantineHighlight>
			</Accordion.Control>
			<Accordion.Panel classNames={{ content: styles.contentWrapper }}>
				<div className={styles.infoBar}>
					{resolvedAlert?.active_period_start_date && <AlertActivePeriodStart date={resolvedAlert.active_period_start_date} size="sm" />}
				</div>
				<p className={styles.description}>{resolvedAlert?.description}</p>
				{resolvedAlert?.image_url && (
					<div className={styles.imageWrapper}>
						<AlertsListItemImageThumbnail alt={resolvedAlert.title} src={resolvedAlert.image_url} />
					</div>
				)}
			</Accordion.Panel>
		</Accordion.Item>
	);

	//
}
