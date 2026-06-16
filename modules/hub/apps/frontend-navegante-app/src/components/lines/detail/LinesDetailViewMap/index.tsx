'use client';

import { useOperationalDate } from '@/components/common/operational-date/use-operational-date';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { MapView } from '@/components/map/MapView';
import { MapViewOverlayVehicles, MapViewOverlayVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleActiveStops, MapViewStyleActiveStopsPrimaryLayerId } from '@/components/map/overlays/MapViewStyleActiveStops';
import { MapViewStylePath, MapViewStylePathInteractiveLayerId } from '@/components/map/overlays/MapViewStylePath';
import { transformStopDataIntoGeoJsonFeature, useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { centerMap, moveMap } from '@/utils/map.utils';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { NoDataLabel, Surface } from '@tmlmobilidade/ui';
import { useMap } from '@vis.gl/react-maplibre';
import { useEffect, useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function LinesDetailViewMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const vehiclesContext = useVehiclesContext();
	const linesDetailContext = useLinesDetailContext();
	const operationalDate = useOperationalDate();

	const { linesDetailMap } = useMap();

	//
	// B. Transform Data

	const activeVehiclesFeatureCollection = useMemo(() => {
		if (!linesDetailContext.data.active_pattern?._id) return;
		return vehiclesContext.actions.getVehiclesByPatternIdGeoJsonFC(linesDetailContext.data.active_pattern?._id);
	}, [linesDetailContext.data.active_pattern?._id, vehiclesContext.actions]);

	const activePathFeatureCollection = useMemo(() => {
		if (!linesDetailContext.data.active_pattern?.path) return;
		const collection = getBaseGeoJsonFeatureCollection();
		linesDetailContext.data.active_pattern.path.forEach((pathStop) => {
			const stopData = stopsContext.actions.getStopById(pathStop.stop_id);
			if (!stopData) return;
			const result = transformStopDataIntoGeoJsonFeature(stopData);
			result.properties = {
				...result.properties,
				// color: linesDetailContext.data.active_pattern?.color,
				// sequence: pathStop.stop_sequence,
				// text_color: linesDetailContext.data.active_pattern?.text_color,
			};
			collection.features.push(result);
		});
		return collection;
	}, [linesDetailContext.data.active_pattern.path, stopsContext.actions]);

	const activeStopFeatureCollection = useMemo(() => {
		// Exit early if there is no active pattern or active waypoint
		if (!linesDetailContext.data.active_waypoint || !linesDetailContext.data.active_pattern) return;
		// Get the stop data for the active waypoint and transform it into a GeoJSON feature
		const foundStop = stopsContext.actions.getStopById(linesDetailContext.data.active_waypoint.stop_id);
		if (!foundStop) return;
		const result = transformStopDataIntoGeoJsonFeature(foundStop);
		result.properties = {
			...result.properties,
			// color: linesDetailContext.data.active_pattern.color,
			// text_color: linesDetailContext.data.active_pattern.text_color,
		};
		// Create a new feature collection and add the active waypoint feature to it
		const collection = getBaseGeoJsonFeatureCollection();
		collection.features.push(result);
		return collection;
		//
	}, [linesDetailContext.data.active_waypoint, linesDetailContext.data.active_pattern, stopsContext.actions]);

	//
	// C. Handle Actions

	useEffect(() => {
		// If map is not yet in interactive mode, then that means the user has not yet selected a stop.
		// Center the map on the full shape and path of the selected pattern.
		// After the user selects a stop, move map to the selected stop.
		if (linesDetailContext.flags.is_interactive_mode) {
			if (!linesDetailContext.data.active_waypoint) return;
			const stopData = stopsContext.actions.getStopById(linesDetailContext.data.active_waypoint.stop_id);
			if (!stopData) return;
			moveMap(linesDetailMap, [stopData.longitude, stopData.latitude]);
		} else {
			if (!linesDetailContext.data.active_shape?.geojson) return;
			centerMap(linesDetailMap, [linesDetailContext.data.active_shape.geojson], { padding: 60 });
		}
	}, [linesDetailMap, linesDetailContext.data.active_waypoint, linesDetailContext.data.active_shape, linesDetailContext.flags.is_interactive_mode, stopsContext.actions]);

	function handleLayerClick(event) {
		if (!linesDetailMap) return;
		const pathFeatures = linesDetailMap.queryRenderedFeatures(event.point, { layers: [MapViewStylePathInteractiveLayerId] });
		if (!pathFeatures.length) return;
		for (const feature of pathFeatures) {
			if (feature.properties.id !== linesDetailContext.data.active_waypoint?.stop_id) {
				linesDetailContext.actions.setActiveWaypoint(feature.properties.id, feature.properties.sequence);
				return;
			}
		}
	}

	function handleCenterMap() {
		if (!linesDetailContext.data.active_shape?.geojson) return;
		centerMap(linesDetailMap, [linesDetailContext.data.active_shape.geojson], { padding: 60 });
	}

	//
	// D. Render copmonents

	if (!linesDetailContext.data.active_pattern || !operationalDate.selectedOperationalDate) {
		return (
			<Surface>
				<NoDataLabel text="No data" />
			</Surface>
		);
	}

	return (
		<div className={styles.container}>
			<MapView
				id="linesDetailMap"
				interactiveLayerIds={[MapViewStylePathInteractiveLayerId, MapViewOverlayVehiclesPrimaryLayerId]}
				onCenterMap={handleCenterMap}
				onClick={handleLayerClick}
			>

				<MapViewOverlayVehicles
					vehiclesData={activeVehiclesFeatureCollection}
				/>

				<MapViewStyleActiveStops
					presentBeforeId={MapViewOverlayVehiclesPrimaryLayerId}
					stopsData={activeStopFeatureCollection}
				/>

				<MapViewStylePath
					presentBeforeId={MapViewStyleActiveStopsPrimaryLayerId}
					shapeData={linesDetailContext.data.active_shape?.geojson}
					waypointsData={activePathFeatureCollection}
				/>

			</MapView>
		</div>
	);

	//
}
