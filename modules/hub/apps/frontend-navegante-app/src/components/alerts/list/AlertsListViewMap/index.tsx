'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { MapView } from '@/components/map/MapView';
import { MapViewStyleAlerts } from '@/components/map/MapViewStyleAlerts';
import { useEffect } from 'react';

/* * */

export function AlertsListViewMap() {
	//

	//
	// A. Setup variables

	const alertsContext = useAlertsContext();

	//
	// B. Handle actions

	useEffect(() => {
		// Exit early if there are no alerts or map
		if (!alertsContext.data.fc.features.length) return;
		// When there are no search filters, center the map on all alerts
		if (!alertsContext.data.fc.features.length) {
			return;
		}
	}, [alertsContext.data.fc.features.length]);

	//
	// C. Render components

	return (
		<MapView id="alerts-list">
			<MapViewStyleAlerts data={alertsContext.data.fc} />
		</MapView>
	);
}
