'use client';

import { MapViewOverlayPlaceLocation } from '@/components/map/MapViewOverlayPlaceLocation';
import { MapViewOverlayStopLineBadges } from '@/components/map/MapViewOverlayStopLineBadges';
import { MapViewOverlayStops } from '@/components/map/MapViewOverlayStops';
import { MapViewOverlayUserLocation } from '@/components/map/MapViewOverlayUserLocation';
import { MapViewOverlayVehicles, MapViewOverlayVehiclesPrimaryLayerId } from '@/components/map/MapViewOverlayVehicles';
import { MapViewStyleActiveStops } from '@/components/map/MapViewStyleActiveStops';
import { MapViewStyleAlerts } from '@/components/map/MapViewStyleAlerts';
import { MapViewStylePath } from '@/components/map/MapViewStylePath';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useMapContext } from '@/contexts/Map.context';
import { useUserLocation } from '@/contexts/UserLocation.context';
import { useBaseMapDerivedData } from '@/hooks/base-map/useBaseMapDerivedData';
import { useBaseMapFocusedEntities } from '@/hooks/base-map/useBaseMapFocusedEntities';
import { type MapLongPressLocation } from '@/hooks/base-map/useMapLongPress';
import { useTranslation } from 'react-i18next';

/* * */

interface BaseMapLayersProps {
	derivedData: ReturnType<typeof useBaseMapDerivedData>
	focusedEntities: ReturnType<typeof useBaseMapFocusedEntities>
	onGetDirections: () => void
	selectedMapLocation: MapLongPressLocation | null
	userLocation: ReturnType<typeof useUserLocation>['data']['location']
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
