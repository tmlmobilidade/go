'use client';

/* * */
import { AlertActivePeriodStart } from '@/components/alerts/common/AlertActivePeriod';
import { AlertEffectIcon } from '@/components/alerts/common/AlertEffectIcon';
import { type HubAlert } from '@tmlmobilidade/types';
import { Section } from '@tmlmobilidade/ui';

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
			<p>{alert.description}</p>
		</Section>
	);

	//
}
