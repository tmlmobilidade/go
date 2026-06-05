'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { MapView } from '@/components/map/MapView';
import { MapViewStyleAlerts, MapViewStyleAlertsLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { type MapLayerMouseEvent } from 'maplibre-gl';
import { useCallback } from 'react';

import styles from './styles.module.css';

/* * */

export function AlertsListViewMap() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();
	const { setActiveBottomSheet } = useBottomSheet();

	//
	// B. Handle actions

	const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
		if (!event.features?.length) return;

		const alertFeature = event.features.find(
			feature => feature.layer?.id === MapViewStyleAlertsLayerId,
		);

		if (!alertFeature) return;

		const alertId = alertFeature.properties?.id ?? alertFeature.properties?._id;

		if (!alertId) return;

		setActiveBottomSheet({ entityId: String(alertId), view: 'alerts-detail' }, { replace: true });
	}, [setActiveBottomSheet]);

	//
	// C. Render components

	return (
		<MapView
			id="alerts-list"
			interactiveLayerIds={[MapViewStyleAlertsLayerId]}
			onClick={handleMapClick}
		>
			<MapViewStyleAlerts data={alertsListContext.data.fc} />
		</MapView>
	);
}
