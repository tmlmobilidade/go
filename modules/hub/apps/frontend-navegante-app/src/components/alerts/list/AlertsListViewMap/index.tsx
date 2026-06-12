'use client';

import { useAlertsListContext } from '@/components/alerts/list/AlertsList.context';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { MapView } from '@/components/map/MapView';
import { MapViewStyleAlerts, MapViewStyleAlertsLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { centerMap, moveMap } from '@/utils/map.utils';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { useMap } from '@vis.gl/react-maplibre';
import { type MapLayerMouseEvent } from 'maplibre-gl';
import { useCallback, useEffect, useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function AlertsListViewMap() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();
	const { activeBottomSheet, setActiveBottomSheet } = useBottomSheet();
	const { alertsListMap } = useMap();

	const focusedAlertId = activeBottomSheet?.view === 'alerts-detail' ? activeBottomSheet.entityId : null;

	//
	// B. Transform data

	const mapFeatureCollection = useMemo(() => {
		if (!focusedAlertId) return alertsListContext.data.fc;

		const collection = getBaseGeoJsonFeatureCollection();

		alertsListContext.data.fc.features.forEach((feature) => {
			const featureId = feature.properties?.id ?? feature.properties?._id;

			if (featureId === focusedAlertId) collection.features.push(feature);
		});

		return collection;
	}, [alertsListContext.data.fc, focusedAlertId]);

	useEffect(() => {
		if (!alertsListMap) return;

		if (focusedAlertId) {
			const focusedFeature = mapFeatureCollection.features.find(
				feature => feature.geometry?.type === 'Point',
			);

			if (!focusedFeature || focusedFeature.geometry?.type !== 'Point') return;

			moveMap(alertsListMap, focusedFeature.geometry.coordinates);
			return;
		}

		if (alertsListContext.data.fc.features.length) {
			centerMap(alertsListMap, alertsListContext.data.fc.features);
		}
	}, [alertsListMap, alertsListContext.data.fc, focusedAlertId, mapFeatureCollection.features]);

	//
	// C. Handle actions

	const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
		if (!event.features?.length) return;

		const alertFeature = event.features.find(
			feature => feature.layer?.id === MapViewStyleAlertsLayerId,
		);

		if (!alertFeature) return;

		const alertId = alertFeature.properties?.id ?? alertFeature.properties?._id;

		if (!alertId || alertFeature.geometry?.type !== 'Point') return;

		const [longitude, latitude] = alertFeature.geometry.coordinates;

		moveMap(event.target, [longitude, latitude]);

		const alertEntityId = String(alertId);

		if (activeBottomSheet?.view === 'alerts-detail' && activeBottomSheet.entityId === alertEntityId) {
			return;
		}

		setActiveBottomSheet({ entityId: alertEntityId, view: 'alerts-detail' });
	}, [activeBottomSheet, setActiveBottomSheet]);

	//
	// D. Render components

	return (
		<div className={styles.container}>
			<MapView
				id="alertsListMap"
				interactiveLayerIds={[MapViewStyleAlertsLayerId]}
				onClick={handleMapClick}
			>
				<MapViewStyleAlerts data={mapFeatureCollection} />
			</MapView>
		</div>
	);
}
