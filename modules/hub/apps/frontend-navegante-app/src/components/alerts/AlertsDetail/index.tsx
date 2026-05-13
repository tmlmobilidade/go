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
import { getAlertDescription, getAlertImageUrl, getAlertMoreInfoUrl, getAlertStartDate, getAlertTitle } from '@/utils/alerts';
import { IconExternalLink } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
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
	const locale = useLocale();
	const alertsContext = useAlertsContext();

	//
	// B. Fetch data

	const alert = alertsContext.actions.getAlertById(alertId);

	//
	// C. Transform data

	const uniqueInformedEntityLineIds = useMemo(() => {
		const set = new Set<string>();

		alert?.informed_entity.forEach((entity) => {
			if (entity.line_id?.trim()) {
				set.add(entity.line_id.trim());
				return;
			}
			const lineId = entity.route_id?.split('_')[0];
			if (lineId) set.add(lineId);
		});
		return Array.from(set);
	}, [alert]);

	const view = useMemo(() => {
		if (!alert) return null;
		return {
			description: getAlertDescription(alert, locale),
			imageUrl: getAlertImageUrl(alert, locale),
			moreInfoUrl: getAlertMoreInfoUrl(alert, locale),
			startDate: getAlertStartDate(alert),
			title: getAlertTitle(alert, locale),
		};
	}, [alert, locale]);

	//
	// D. Render components

	return (
		<>

			<Surface>
				<Section withBottomDivider withPadding>
					<BackButton href="/?section=alerts" />
				</Section>
				<Section heading={view?.title} withBottomDivider withPadding>
					<div className={styles.infoBar}>
						{alert?.cause && <AlertCauseIcon cause={alert.cause} withText />}
						{alert?.effect && <AlertEffectIcon effect={alert.effect} withText />}
						{view?.startDate && <AlertActivePeriodStart date={view.startDate} />}
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
						{view?.description && <p className={styles.description}>{view.description}</p>}
						{view?.imageUrl && <AlertsDetailImageThumbnail imageUrl={view.imageUrl} title={view.title} />}
						{view?.moreInfoUrl && <Button href={view.moreInfoUrl} icon={<IconExternalLink size={18} />} label={t('more_info')} />}
					</div>
				</Section>
			</Surface>

		</>
	);

	//
}
