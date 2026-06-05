'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { MapView } from '@/components/map/MapView';
import { MapViewStyleAlerts, MapViewStyleAlertsLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { moveMap } from '@/utils/map.utils';
import { useMap } from '@vis.gl/react-maplibre';
import { type MapLayerMouseEvent } from 'maplibre-gl';
import { useCallback } from 'react';

/* * */

export function AlertsListViewMap() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();
	const { setActiveBottomSheet } = useBottomSheet();
	const { alertsListMap } = useMap();

	//
	// B. Handle actions

	const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
		if (!event.features?.length) return;

		const alertFeature = event.features.find(
			feature => feature.layer?.id === MapViewStyleAlertsLayerId,
		);

		if (!alertFeature) return;

		const alertId = alertFeature.properties?.id ?? alertFeature.properties?._id;

		if (!alertId || alertFeature.geometry?.type !== 'Point') return;

		const [longitude, latitude] = alertFeature.geometry.coordinates;

		moveMap(alertsListMap, [longitude, latitude]);
		setActiveBottomSheet({ entityId: String(alertId), view: 'alerts-detail' }, { replace: true });
	}, [alertsListMap, setActiveBottomSheet]);

	//
	// C. Render components

	return (
		<MapView
			id="alertsListMap"
			interactiveLayerIds={[MapViewStyleAlertsLayerId]}
			onClick={handleMapClick}
		>
			<MapViewStyleAlerts data={alertsListContext.data.fc} />
		</MapView>
	);
}
