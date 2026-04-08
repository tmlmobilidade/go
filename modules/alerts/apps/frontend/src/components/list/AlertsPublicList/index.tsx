'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/types';
import { ErrorDisplay, Loader } from '@tmlmobilidade/ui';
import useSWR from 'swr';

/* * */

export default function AlertsPublicList() {
	//

	//
	// A. Setup Variables

	const alertsPublicApiUrl = `${API_ROUTES.alerts.BASE}/alerts/public`;
	const { data: alerts, error: alertsError, isLoading: alertsLoading } = useSWR<Alert[]>(alertsPublicApiUrl);

	//
	// B. Render Components

	if (alertsLoading) {
		return <Loader size="xl" />;
	}

	if (alertsError) {
		return <ErrorDisplay message={alertsError.message} />;
	}

	return (
		<div>
			<h1>Alerts Public List</h1>
			{alerts?.map(alert => (
				<div key={alert._id}>
					<h2>{alert.title}</h2>
					<p>{alert.description}</p>
				</div>
			))}
		</div>
	);

	//
}
