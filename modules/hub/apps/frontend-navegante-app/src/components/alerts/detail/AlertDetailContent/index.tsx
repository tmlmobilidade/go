'use client';

/* * */
import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { AlertsListItemImageThumbnail } from '@/components/alerts/list/AlertsListItemImageThumbnail';
import { type HubAlert } from '@tmlmobilidade/go-types-public-info';
import { Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface AlertDetailContentProps {
	alert: HubAlert
}

/* * */

export function AlertDetailContent({ alert }: AlertDetailContentProps) {
	//

	//
	// B. Render components

	if (!alert) return null;

	return (
		<Section padding="md">

			{alert.active_period_start_date && (
				<AlertActivePeriodStart date={alert.active_period_start_date} size="sm" />
			)}

			<p className={styles.description}>{alert.description}</p>

			{alert.image_url && (
				<div className={styles.imageWrapper}>
					<AlertsListItemImageThumbnail alt={alert.title} src={alert.image_url} />
				</div>
			)}

		</Section>
	);

	//
}
