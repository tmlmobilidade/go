'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useBaseMapPatternData } from '@/components/common/base-map/use-base-map-pattern-data';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useMapContext } from '@/components/map/Map.context';
import { MapView } from '@/components/map/MapView';
import { MapViewOverlayStopLineBadges } from '@/components/map/overlays/MapViewOverlayStopLineBadges';
import { MapViewOverlayStops, MapViewOverlayStopsInteractiveLayerId } from '@/components/map/overlays/MapViewOverlayStops';
import { MapViewOverlayUserLocation } from '@/components/map/overlays/MapViewOverlayUserLocation';
// import { MapViewOverlayVehicleLineBadges } from '@/components/map/overlays/MapViewOverlayVehicleLineBadges';
import { MapViewOverlayVehicles, MapViewOverlayVehiclesInteractiveLayerId, MapViewOverlayVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleAlerts, MapViewStyleAlertsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { MapViewStylePath } from '@/components/map/overlays/MapViewStylePath';
import { useUserLocation } from '@/components/map/use-user-location';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { fromEncodedPolylineToGeoJsonLineString } from '@tmlmobilidade/go-utils-geo';
import { type MapLayerMouseEvent, useMap } from '@vis.gl/react-maplibre';
import { FeatureCollection, LineString } from 'geojson';
import { useEffect, useMemo } from 'react';

/* * */

export function BaseMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const alertsContext = useAlertsContext();
	const vehiclesContext = useVehiclesContext();

	const { data: { activeBaseMapOverlays } } = useMapContext();
	const { setUserLocationTrackingMode, userLocation } = useUserLocation();
	const { activeBottomSheet, setActiveBottomSheet } = useBottomSheet();

	const { 'viewport-map': viewportMap } = useMap();

	const focusedAlertId = activeBottomSheet?.view === 'alerts-detail' ? activeBottomSheet.entityId : null;
	const focusedVehicleId = activeBottomSheet?.view === 'vehicles-detail' ? activeBottomSheet.entityId : null;

	const focusedVehiclePatternId = useMemo(() => {
		if (!focusedVehicleId) return null;
		return vehiclesContext.data.vehicles.find(vehicle => vehicle.vehicle_id === focusedVehicleId)?.pattern_id ?? null;
	}, [focusedVehicleId, vehiclesContext.data.vehicles]);

	//
	// B. Fetch data

	const { data: patternsData } = useBaseMapPatternData(focusedVehiclePatternId);

	//
	// C. Transform data

	const alertsMapData = useMemo(() => {
		if (!focusedAlertId) return alertsContext.data.fc;
		const collection = getBaseGeoJsonFeatureCollection();
		alertsContext.data.fc.features.forEach((feature) => {
			const featureId = feature.properties?.id ?? feature.properties?._id;
			if (featureId === focusedAlertId) collection.features.push(feature);
		});
		return collection;
	}, [alertsContext.data.fc, focusedAlertId]);

	const vehiclesMapData = useMemo(() => {
		if (!focusedVehicleId) return vehiclesContext.data.fc;
		const collection = getBaseGeoJsonFeatureCollection();
		vehiclesContext.data.fc.features.forEach((feature) => {
			if (feature.properties?.vehicle_id === focusedVehicleId) collection.features.push(feature);
		});
		return collection;
	}, [vehiclesContext.data.fc, focusedVehicleId]);

	const shapeFc = useMemo(() => {
		const collection: FeatureCollection<LineString> = { features: [], type: 'FeatureCollection' };
		if (!patternsData?.[0]?.shape_polyline) return collection;
		const shapeGeojson = fromEncodedPolylineToGeoJsonLineString(patternsData[0].shape_polyline);
		collection.features.push({
			geometry: shapeGeojson,
			properties: {
				color: patternsData[0].color,
				text_color: patternsData[0].text_color,
			},
			type: 'Feature',
		});
		return collection;
	}, [patternsData]);

	useEffect(() => {
		if (!viewportMap || !focusedAlertId || !activeBaseMapOverlays.includes('alerts')) return;
		const focusedFeature = alertsMapData.features.find(feature => feature.geometry?.type === 'Point');
		if (!focusedFeature || focusedFeature.geometry?.type !== 'Point') return;
		// moveMap(viewportMap, focusedFeature.geometry.coordinates);
	}, [viewportMap, focusedAlertId, alertsMapData.features, activeBaseMapOverlays]);

	//
	// D. Handle actions

	const handleMapClick = (event: MapLayerMouseEvent) => {
		if (!event.features?.length) return;

		const feature = event.features[0];
		const layerId = feature.layer?.id;

		if (layerId === MapViewOverlayStopsInteractiveLayerId) {
			if (!feature.properties._id) return;
			setActiveBottomSheet({ entityId: String(feature.properties._id), view: 'stops-detail' }, { replace: true });
			return;
		}

		if (layerId === MapViewStyleAlertsInteractiveLayerId) {
			if (!feature.properties._id) return;
			setActiveBottomSheet({ entityId: String(feature.properties._id), view: 'alerts-detail' }, { replace: true });
			return;
		}

		if (layerId === MapViewOverlayVehiclesInteractiveLayerId) {
			if (!feature.properties.vehicle_id) return;
			setActiveBottomSheet({ entityId: String(feature.properties.vehicle_id), view: 'vehicles-detail' }, { replace: true });
			return;
		}
	};

	const handleMapDrag = () => {
		setUserLocationTrackingMode('idle');
	};

	//
	// E. Render components

	return (
		<MapView
			id="base-map"
			onClick={handleMapClick}
			onDrag={handleMapDrag}
			interactiveLayerIds={[
				MapViewOverlayVehiclesPrimaryLayerId,
				MapViewOverlayStopsInteractiveLayerId,
				MapViewStyleAlertsInteractiveLayerId,
			]}
		>

			<MapViewOverlayStops
				stopsData={stopsContext.data.fc}
				visible={activeBaseMapOverlays.includes('stops')}
			/>
			<MapViewOverlayStopLineBadges
				visible={activeBaseMapOverlays.includes('stops')}
			/>

			<MapViewOverlayVehicles
				vehiclesData={vehiclesMapData}
				visible={activeBaseMapOverlays.includes('vehicles')}
			/>

			{shapeFc.features.length > 0 && (
				<MapViewStylePath
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={shapeFc}
				/>
			)}
			{/* <MapViewOverlayVehicleLineBadges
				visible={activeBaseMapOverlays.includes('vehicles')}
			/> */}

			<MapViewStyleAlerts
				data={alertsMapData}
				visible={activeBaseMapOverlays.includes('alerts')}
			/>
			<MapViewOverlayUserLocation
				latitude={userLocation?.latitude}
				longitude={userLocation?.longitude}
			/>
		</MapView>
	);
}
