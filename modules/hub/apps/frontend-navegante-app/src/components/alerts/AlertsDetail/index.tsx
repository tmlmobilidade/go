'use client';

import { AlertActivePeriodStart } from '@/components/alerts/AlertActivePeriod';
import { AlertCauseIcon, AlertEffectIcon } from '@/components/alerts/AlertCauseEffectIcon';
import { AlertInformedEntity } from '@/components/alerts/AlertInformedEntity';
import { AlertsDetailImageThumbnail } from '@/components/alerts/AlertsDetailImageThumbnail';
import { BackButton } from '@/components/common/BackButton';
import Button from '@/components/common/Button';
import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';
import { useAlertsContext } from '@/contexts/Alerts.context';
import { IconExternalLink } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface Props {
	alertId: string
}

/* * */

export function AlertsDetail({ alertId }: Props) {
	//

	//
	// A. Setup variables

	const t = useTranslations('alerts.AlertsDetail');
	const alertsContext = useAlertsContext();

	//
	// B. Fetch data

	const alert = alertsContext.actions.getAlertById(alertId);

	//
	// C. Transform data

	const uniqueInformedEntityLineIds = useMemo(() => {
		const set = new Set<string>();

		alert?.informed_entity.forEach((entity) => {
			const lineId = entity.route_id?.split('_')[0];
			if (lineId) set.add(lineId);
		});
		return Array.from(set);
	}, [alert]);

	//
	// D. Render components

	return (
		<>

			<Surface>
				<Section withBottomDivider withPadding>
					<BackButton href="/?section=alerts" />
				</Section>
				<Section heading={alert?.title} withBottomDivider withPadding>
					<div className={styles.infoBar}>
						{alert?.cause && <AlertCauseIcon cause={alert.cause} withText />}
						{alert?.effect && <AlertEffectIcon effect={alert.effect} withText />}
						{alert?.start_date && <AlertActivePeriodStart date={alert.start_date} />}
					</div>
				</Section>
				{alert?.informed_entity && (
					<Section withPadding>
						<div className={styles.infoBar}>
							{uniqueInformedEntityLineIds.map((lineId, index) => (
								<AlertInformedEntity key={index} lineId={lineId} />
							))}
						</div>
					</Section>
				)}
			</Surface>

			<Surface>
				<Section withPadding>
					<div className={styles.contentWrapper}>
						{alert?.description && <p className={styles.description}>{alert.description}</p>}
						{alert?.image_url && <AlertsDetailImageThumbnail imageUrl={alert?.image_url} title={alert?.title} />}
						{alert?.url && <Button href={alert.url || '#'} icon={<IconExternalLink size={18} />} label={t('more_info')} />}
					</div>
				</Section>
			</Surface>

		</>
	);

	//
}
