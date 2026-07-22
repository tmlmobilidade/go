'use client';

import { useBaseMapDerivedData } from '@/components/common/base-map/useBaseMapDerivedData';
import { useBaseMapFocusedEntities } from '@/components/common/base-map/useBaseMapFocusedEntities';
import { useMapContext } from '@/components/map/Map.context';
import { MapViewOverlayPlaceLocation } from '@/components/map/overlays/MapViewOverlayPlaceLocation';
import { MapViewOverlayStopLineBadges } from '@/components/map/overlays/MapViewOverlayStopLineBadges';
import { MapViewOverlayStops } from '@/components/map/overlays/MapViewOverlayStops';
import { MapViewOverlayUserLocation } from '@/components/map/overlays/MapViewOverlayUserLocation';
import { MapViewOverlayVehicles, MapViewOverlayVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleActiveStops } from '@/components/map/overlays/MapViewStyleActiveStops';
import { MapViewStyleAlerts } from '@/components/map/overlays/MapViewStyleAlerts';
import { MapViewStylePath } from '@/components/map/overlays/MapViewStylePath';
import { useUserLocation } from '@/components/map/use-user-location';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { type MapLongPressLocation } from '@/hooks/useMapLongPress';
import { useTranslation } from 'react-i18next';

/* * */

interface BaseMapLayersProps {
	derivedData: ReturnType<typeof useBaseMapDerivedData>
	focusedEntities: ReturnType<typeof useBaseMapFocusedEntities>
	onGetDirections: () => void
	selectedMapLocation: MapLongPressLocation | null
	userLocation: ReturnType<typeof useUserLocation>['userLocation']
}

/* * */

export function BaseMapLayers(props: BaseMapLayersProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();
	const { data: { activeBaseMapOverlays } } = useMapContext();

	//
	// B. Render components

	return (
		<>
			<MapViewOverlayStops
				stopsData={props.focusedEntities.stopsMapData}
				visible
			/>
			<MapViewOverlayStopLineBadges visible />

			{props.focusedEntities.focusedStopMapData && (
				<MapViewStyleActiveStops
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					stopsData={props.focusedEntities.focusedStopMapData}
				/>
			)}

			{props.focusedEntities.focusedLineShape && (
				<MapViewStylePath
					idPrefix="line-detail"
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={props.focusedEntities.focusedLineShape}
				/>
			)}

			{props.focusedEntities.shape?.geojson && props.focusedEntities.pattern && (
				<MapViewStylePath
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={{
						...props.focusedEntities.shape.geojson,
						properties: {
							color: props.focusedEntities.pattern.color,
							text_color: props.focusedEntities.pattern.text_color,
						},
					}}
				/>
			)}

			{props.derivedData.routePlannerContextShapeData.features.length > 0 && (
				<MapViewStylePath
					idPrefix="route-planner-context"
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					shapeData={props.derivedData.routePlannerContextShapeData}
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
				alwaysShowVehicles={props.derivedData.shouldAlwaysShowFilteredVehicles}
				vehiclesData={props.derivedData.vehiclesMapData}
				visible={activeBaseMapOverlays.includes('vehicles')}
			/>
			<MapViewStyleAlerts
				data={props.derivedData.alertsMapData}
				visible={activeBaseMapOverlays.includes('alerts')}
			/>
			<MapViewOverlayPlaceLocation
				latitude={props.derivedData.placeDestination?.lat}
				longitude={props.derivedData.placeDestination?.lon}
				visible={Boolean(props.derivedData.placeDestination)}
			/>
			<MapViewOverlayPlaceLocation
				directionsLabel={t('default:map.MapLocationPin.get_directions')}
				latitude={props.selectedMapLocation?.latitude}
				longitude={props.selectedMapLocation?.longitude}
				onDirections={props.onGetDirections}
				visible={Boolean(props.selectedMapLocation)}
			/>
			<MapViewOverlayUserLocation
				latitude={props.userLocation?.latitude}
				longitude={props.userLocation?.longitude}
			/>
		</>
	);

	//
}
