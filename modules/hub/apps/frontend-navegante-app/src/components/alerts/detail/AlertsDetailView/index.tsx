'use client';

import { AlertDetailContent } from '@/components/alerts/detail/AlertDetailContent';
import { AlertDetailViewHeader } from '@/components/alerts/detail/AlertDetailViewHeader';
import { type HubV1ApiAlert } from '@tmlmobilidade/go-types-hub';
import { Section } from '@tmlmobilidade/ui';

/* * */

interface AlertsDetailViewProps {
	alert: HubV1ApiAlert
}

export function AlertsDetailView({ alert }: AlertsDetailViewProps) {
	//

	//
	// A. Render components

	return (
		<Section padding="none">
			<AlertDetailViewHeader effect={alert?.effect} title={alert?.title} />
			<AlertDetailContent alert={alert} />
		</Section>
	);
}
