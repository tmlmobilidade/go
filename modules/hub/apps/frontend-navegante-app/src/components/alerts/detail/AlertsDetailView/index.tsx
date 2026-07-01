'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { AlertDetailContent } from '@/components/alerts/detail/AlertDetailContent';
import { AlertDetailViewHeader } from '@/components/alerts/detail/AlertDetailViewHeader';
import { Space } from '@mantine/core';
import { type HubAlert } from '@tmlmobilidade/go-types-public-info';
import { LoadingSection, Section } from '@tmlmobilidade/ui';

/* * */

interface AlertsDetailViewProps {
	alert: HubAlert
}

export function AlertsDetailView({ alert }: AlertsDetailViewProps) {
	//

	//
	// A. Setup variables

	const alertsContext = useAlertsContext();

	//
	// B. Render componentss

	if (alertsContext.flags.isLoading) {
		return (
			<>
				<Space h="90px" />
				<LoadingSection />
			</>
		);
	}

	return (
		<Section padding="none">
			<AlertDetailViewHeader effect={alert?.effect} title={alert?.title} />
			<AlertDetailContent alert={alert} />
		</Section>
	);
}
