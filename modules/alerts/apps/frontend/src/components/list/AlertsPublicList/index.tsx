'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/types';
import { Grid, Loader, Section, Surface } from '@tmlmobilidade/ui';
import useSWR from 'swr';

/* * */

export default function AlertsPublicList() {
	//

	//
	// A. Setup Variables

	const alertsPublicApiUrl = `${API_ROUTES.alerts.BASE}/alerts/public`;
	const { data: alerts, isLoading: alertsLoading } = useSWR<Alert[]>(alertsPublicApiUrl);

	//
	// B. Render Components

	if (alertsLoading) {
		return <Loader size="xl" />;
	}

	return (
		<Surface>
			<Section>
				<Grid columns="a" gap="md">
					{alerts?.map(alert => (
						<div key={alert._id}>
							<h2>{alert.title}</h2>
							<p>{alert.description}</p>
						</div>
					))}
				</Grid>
			</Section>
		</Surface>
	);

	//
}
