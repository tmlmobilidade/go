'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useBaseMap } from '@/components/common/base-map/use-base-map';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { MapView } from '@/components/map/MapView';
import { MapViewOverlayVehicles, MapViewStyleVehiclesInteractiveLayerId, MapViewStyleVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleAlerts, MapViewStyleAlertsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { MapViewStylePath } from '@/components/map/overlays/MapViewStylePath';
import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleStops';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { type HubPattern } from '@/types/api/network';
import { centerMap, moveMap } from '@/utils/map.utils';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubShape } from '@tmlmobilidade/types';
import { MapLayerMouseEvent, useMap } from '@vis.gl/react-maplibre';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function BaseMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const alertsContext = useAlertsContext();
	const vehiclesContext = useVehiclesContext();

	const { activeBottomSheet, setActiveBottomSheet } = useBottomSheet();

	const { activeBaseMapOverlays } = useBaseMap();

	const { 'viewport-map': viewportMap } = useMap();

	const focusedAlertId = activeBottomSheet?.view === 'alerts-detail' ? activeBottomSheet.entityId : null;
	const focusedVehicleId = activeBottomSheet?.view === 'vehicles-detail' ? activeBottomSheet.entityId : null;

	const focusedVehiclePatternId = useMemo(() => {
		if (!focusedVehicleId) return null;

		return vehiclesContext.data.vehicles.find(vehicle => vehicle.vehicle_id === focusedVehicleId)?.pattern_id ?? null;
	}, [focusedVehicleId, vehiclesContext.data.vehicles]);

	const { data: patterns } = useSWR<HubPattern[]>(
		focusedVehiclePatternId ? { credentials: 'omit', url: API_ROUTES.hub.NETWORK_PATTERNS(focusedVehiclePatternId) } : null,
	);

	const pattern = patterns?.[0];

	const { data: shape } = useSWR<HubShape>(
		pattern?.shape_id ? { credentials: 'omit', url: API_ROUTES.hub.NETWORK_SHAPES(pattern.shape_id) } : null,
	);

	const alertsMapData = useMemo(() => {
		if (!focusedAlertId) return alertsContext.data.fc;

		const collection = getBaseGeoJsonFeatureCollection();

		alertsContext.data.fc.features.forEach((feature) => {
			const featureId = feature.properties?.id ?? feature.properties?._id;

			if (featureId === focusedAlertId) collection.features.push(feature);
		});

		return collection;
	}, [alertsContext.data.fc, focusedAlertId]);

	useEffect(() => {
		if (!viewportMap || !focusedAlertId || !activeBaseMapOverlays.includes('alerts')) return;

		const focusedFeature = alertsMapData.features.find(
			feature => feature.geometry?.type === 'Point',
		);

		if (!focusedFeature || focusedFeature.geometry?.type !== 'Point') return;

		moveMap(viewportMap, focusedFeature.geometry.coordinates);
	}, [viewportMap, focusedAlertId, alertsMapData.features, activeBaseMapOverlays]);

	useEffect(() => {
		if (!viewportMap || !shape?.geojson) return;

		centerMap(viewportMap, [shape.geojson], {
			padding: { bottom: 320, left: 80, right: 80, top: 80 },
		});
	}, [viewportMap, shape?.geojson]);

	//
	// C. Handle actions

	const handleMapClick = (event: MapLayerMouseEvent) => {
		if (!event.features?.length) return;

		const feature = event.features[0];
		const layerId = feature.layer?.id;

		if (layerId === MapViewStyleStopsInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(feature.properties._id), view: 'stops-detail' }, { replace: true });
			return;
		}

		if (layerId === MapViewStyleAlertsInteractiveLayerId) {
			const alertId = feature.properties.id ?? feature.properties._id;

			if (!alertId || feature.geometry?.type !== 'Point') return;

			const [longitude, latitude] = feature.geometry.coordinates;

			moveMap(event.target, [longitude, latitude]);
			setActiveBottomSheet({ entityId: String(alertId), view: 'alerts-detail' }, { replace: true });
			return;
		}

		if (layerId === MapViewStyleVehiclesInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(feature.properties.vehicle_id), view: 'vehicles-detail' }, { replace: true });
		}
	};

	//
	// B. Render components

	return (
		<MapView
			id="viewport-map"
			interactiveLayerIds={[MapViewStyleVehiclesPrimaryLayerId, MapViewStyleStopsInteractiveLayerId, MapViewStyleAlertsInteractiveLayerId]}
			onClick={handleMapClick}
		>
			<MapViewStyleStops
				stopsData={stopsContext.data.fc}
				visible={activeBaseMapOverlays.includes('stops')}
			/>
			{shape?.geojson && pattern && (
				<MapViewStylePath
					presentBeforeId={MapViewStyleVehiclesPrimaryLayerId}
					shapeData={{
						...shape.geojson,
						properties: {
							color: pattern.color,
							text_color: pattern.text_color,
						},
					}}
				/>
			)}
			<MapViewOverlayVehicles
				vehiclesData={vehiclesContext.data.fc}
				visible={activeBaseMapOverlays.includes('vehicles')}
			/>
			<MapViewStyleAlerts
				data={alertsMapData}
				visible={activeBaseMapOverlays.includes('alerts')}
			/>
		</MapView>
	);
}
