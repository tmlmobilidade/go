'use client';

import { useBaseMapCameraSync } from '@/components/common/base-map/useBaseMapCameraSync';
import { useBaseMapDerivedData } from '@/components/common/base-map/useBaseMapDerivedData';
import { useBaseMapFocusedEntities } from '@/components/common/base-map/useBaseMapFocusedEntities';
import { baseMapInteractiveLayerIds, useBaseMapInteractions } from '@/components/common/base-map/useBaseMapInteractions';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useMapContext } from '@/components/map/Map.context';
import { MapView } from '@/components/map/MapView';
import { MapViewOverlayPlaceLocation } from '@/components/map/overlays/MapViewOverlayPlaceLocation';
import { MapViewOverlayStopLineBadges } from '@/components/map/overlays/MapViewOverlayStopLineBadges';
import { MapViewOverlayStops } from '@/components/map/overlays/MapViewOverlayStops';
import { MapViewOverlayUserLocation } from '@/components/map/overlays/MapViewOverlayUserLocation';
// import { MapViewOverlayVehicleLineBadges } from '@/components/map/overlays/MapViewOverlayVehicleLineBadges';
import { MapViewOverlayVehicles, MapViewOverlayVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleActiveStops } from '@/components/map/overlays/MapViewStyleActiveStops';
import { MapViewStyleAlerts } from '@/components/map/overlays/MapViewStyleAlerts';
import { MapViewStylePath } from '@/components/map/overlays/MapViewStylePath';
import { useUserLocation } from '@/components/map/use-user-location';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useTranslation } from 'react-i18next';

/* * */

export function BaseMap() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();

	const { data: { activeBaseMapOverlays, excludedBaseMapOperatorIds } } = useMapContext();
	const { setUserLocationTrackingMode, userLocation } = useUserLocation();
	const { activeBottomSheet } = useBottomSheet();

	const {
		focusedAlertId,
		focusedLineShape,
		focusedStop,
		focusedStopMapData,
		focusedVehicleId,
		pattern,
		shape,
		stopsMapData,
	} = useBaseMapFocusedEntities({ activeBottomSheet });

	const {
		alertsMapData: operatorFilteredAlertsMapData,
		placeDestination,
		routePlannerContextShapeData,
		routePlannerMapFitFeatures,
		shouldAlwaysShowFilteredVehicles,
		vehiclesMapData: operatorFilteredVehiclesMapData,
	} = useBaseMapDerivedData({
		activeBottomSheet,
		excludedOperatorIds: excludedBaseMapOperatorIds,
		focusedAlertId,
		focusedVehicleId,
	});

	useBaseMapCameraSync({
		focusedLineShape,
		focusedStop,
		placeDestination,
		routePlannerMapFitFeatures,
	});

	const { handleGetDirections, mapViewInteractionProps, selectedMapLocation } = useBaseMapInteractions({
		setUserLocationTrackingMode,
	});

	//
	// B. Render components

	return (
		<MapView
			{...mapViewInteractionProps}
			id="base-map"
			interactiveLayerIds={baseMapInteractiveLayerIds}
		>

			<MapViewOverlayStops
				stopsData={stopsMapData}
				visible
			/>
			<MapViewOverlayStopLineBadges
				visible
			/>

			{focusedStopMapData && (
				<MapViewStyleActiveStops
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					stopsData={focusedStopMapData}
				/>
			)}

			{focusedLineShape && (
				<MapViewStylePath
					idPrefix="line-detail"
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={focusedLineShape}
				/>
			)}

			{shape?.geojson && pattern && (
				<MapViewStylePath
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={{
						...shape.geojson,
						properties: {
							color: pattern.color,
							text_color: pattern.text_color,
						},
					}}
				/>
			)}

			{routePlannerContextShapeData.features.length > 0 && (
				<MapViewStylePath
					idPrefix="route-planner-context"
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={routePlannerContextShapeData}
					variant="context"
				/>
			)}

			{routePlannerContext.data.route_map_data.shapeData.features.length > 0 && (
				<MapViewStylePath
					idPrefix="route-planner"
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={routePlannerContext.data.route_map_data.shapeData}
					waypointsData={routePlannerContext.data.route_map_data.waypointsData}
				/>
			)}

			<MapViewOverlayVehicles
				alwaysShowVehicles={shouldAlwaysShowFilteredVehicles}
				vehiclesData={operatorFilteredVehiclesMapData}
				visible={activeBaseMapOverlays.includes('vehicles')}
			/>
			{/* <MapViewOverlayVehicleLineBadges
				visible={activeBaseMapOverlays.includes('vehicles')}
			/> */}

			<MapViewStyleAlerts
				data={operatorFilteredAlertsMapData}
				visible={activeBaseMapOverlays.includes('alerts')}
			/>
			<MapViewOverlayPlaceLocation
				latitude={placeDestination?.lat}
				longitude={placeDestination?.lon}
				visible={Boolean(placeDestination)}
			/>
			<MapViewOverlayPlaceLocation
				directionsLabel={t('default:map.MapLocationPin.get_directions')}
				latitude={selectedMapLocation?.latitude}
				longitude={selectedMapLocation?.longitude}
				onDirections={handleGetDirections}
				visible={Boolean(selectedMapLocation)}
			/>
			<MapViewOverlayUserLocation
				latitude={userLocation?.latitude}
				longitude={userLocation?.longitude}
			/>
		</MapView>
	);
}
