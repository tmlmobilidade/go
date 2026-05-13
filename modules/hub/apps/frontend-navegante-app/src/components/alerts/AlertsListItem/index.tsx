'use client';

import { AlertActivePeriodEnd, AlertActivePeriodStart } from '@/components/alerts/AlertActivePeriod';
import { AlertEffectIcon } from '@/components/alerts/AlertCauseEffectIcon';
import AlertsListItemImageThumbnail from '@/components/alerts/AlertsListItemImageThumbnail';
import Button from '@/components/common/Button';
import { useAlertsContext } from '@/contexts/Alerts.context';
import { useEnvironmentContext } from '@/contexts/Environment.context';
import { getAlertDescription, getAlertEndDate, getAlertImageUrl, getAlertStartDate, getAlertTitle } from '@/utils/alerts';
import { Accordion } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

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
	const locale = useLocale();
	const alertsContext = useAlertsContext();
	const environmentContext = useEnvironmentContext();

	//
	// B. Transform data

	const resolvedAlert = alertsContext.actions.getAlertById(alertId);

	const view = useMemo(() => {
		if (!resolvedAlert) return null;
		return {
			description: getAlertDescription(resolvedAlert, locale),
			endDate: getAlertEndDate(resolvedAlert),
			imageUrl: getAlertImageUrl(resolvedAlert, locale),
			startDate: getAlertStartDate(resolvedAlert),
			title: getAlertTitle(resolvedAlert, locale),
		};
	}, [resolvedAlert, locale]);

	const alertHref = environmentContext.actions.getNormalizedHref(`/alerts/${alertId}`);

	//
	// C. Render components

	return (
		<Accordion.Item value={alertId}>
			<Accordion.Control icon={<AlertEffectIcon effect={resolvedAlert?.effect} />}>{view?.title}</Accordion.Control>
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
			</Accordion.Panel>
		</Accordion.Item>
	);

	//
}
