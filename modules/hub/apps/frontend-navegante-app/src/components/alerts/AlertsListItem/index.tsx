'use client';

import { AlertActivePeriodEnd, AlertActivePeriodStart } from '@/components/alerts/AlertActivePeriod';
import { AlertEffectIcon } from '@/components/alerts/AlertCauseEffectIcon';
import AlertsListItemImageThumbnail from '@/components/alerts/AlertsListItemImageThumbnail';
import Button from '@/components/common/Button';
import { useAlertsContext } from '@/contexts/Alerts.context';
import { useEnvironmentContext } from '@/contexts/Environment.context';
import { Accordion } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

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

	const t = useTranslations('alerts.AlertsListItem');
	const alertsContext = useAlertsContext();
	const environmentContext = useEnvironmentContext();

	//
	// B. Transform data

	const resolvedAlert = alertsContext.actions.getAlertById(alertId);

	const alertHref = environmentContext.actions.getNormalizedHref(`/alerts/${alertId}`);

	//
	// C. Render components

	return (
		<Accordion.Item value={alertId}>
			<Accordion.Control icon={<AlertEffectIcon effect={resolvedAlert?.effect} />}>{resolvedAlert?.title}</Accordion.Control>
			<Accordion.Panel classNames={{ content: styles.contentWrapper }}>
				<div className={styles.infoBar}>
					<AlertActivePeriodStart date={resolvedAlert?.start_date} size="sm" />
					<AlertActivePeriodEnd date={resolvedAlert?.end_date} size="sm" />
				</div>
				<p className={styles.description}>{resolvedAlert?.description}</p>
				{resolvedAlert?.image_url && <AlertsListItemImageThumbnail alertId={resolvedAlert?.alert_id || ''} alertTitle={resolvedAlert?.title || ''} alt={resolvedAlert?.title} href={`/alerts/${alertId}`} src={resolvedAlert.image_url} />}
				<div>
					<Button href={alertHref} icon={<IconArrowUpRight size={16} />} label={t('open')} variant="pill" />
				</div>
			</Accordion.Panel>
		</Accordion.Item>
	);

	//
}
