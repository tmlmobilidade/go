'use client';

import { MapView } from '@/components/map/MapView';
import { MapViewStyleAlertsLayerId, MapViewStyleAlertsSourceId } from '@/components/map/MapViewStyleAlerts';
import { MapViewStylePath } from '@/components/map/MapViewStylePath';
import { MapViewStyleVehicles, MapViewStyleVehiclesInteractiveLayerId, MapViewStyleVehiclesPrimaryLayerId } from '@/components/map/MapViewStyleVehicles';
import { useEnvironmentContext } from '@/contexts/Environment.context';
import { transformStopDataIntoGeoJsonFeature, useStopsContext } from '@/contexts/Stops.context';
import { transformVehicleDataIntoGeoJsonFeature, useVehiclesContext } from '@/contexts/Vehicles.context';
import { useVehiclesListContext } from '@/contexts/VehiclesList.context';
import { getPublicVariable } from '@/settings/public-variables';
import { centerMap, getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import getOperationalDate from '@/utils/operation';
import { type NetworkPattern, type NetworkShape } from '@carrismetropolitana/navegante-tempo-real-shared-types';
import { useMap } from '@vis.gl/react-maplibre';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

/* * */

export function VehiclesListMap() {
	//

	//
	// A. Setup variables

	const { vehiclesListMap } = useMap();

	const router = useRouter();
	const vehiclesListContext = useVehiclesListContext();
	const vehiclesContext = useVehiclesContext();
	const stopsContext = useStopsContext();
	const environmentContext = useEnvironmentContext();

	const [isAutoZoom, setIsAutoZoom] = useState(true);
	const [activePatternData, setActivePatternData] = useState<NetworkPattern | undefined>();
	const [activeShapeData, setActiveShapeData] = useState<NetworkShape | undefined>();

	//
	// B. Fetch data

	useEffect(() => {
		(async () => {
			if (!vehiclesListContext.data.selected) return;
			if (vehiclesListContext.data.selected.pattern_id) {
				const todayOperationalDate = getOperationalDate();
				const fetchedPatternResponse = await fetch(`${getPublicVariable('api_url')}/patterns/${vehiclesListContext.data.selected.pattern_id}`);
				const fetchedPatternData = await fetchedPatternResponse.json();
				const activePatternVersion = fetchedPatternData.find(item => item.valid_on.includes(todayOperationalDate));
				setActivePatternData(activePatternVersion);
			}
		})();
	}, [vehiclesListContext.data.selected]);

	useEffect(() => {
		(async () => {
			if (!activePatternData?.shape_id) {
				setActiveShapeData(undefined);
				return;
			}
			const fetchedShapeResponse = await fetch(`${getPublicVariable('api_url')}/shapes/${activePatternData.shape_id}`);
			if (!fetchedShapeResponse.ok) return;
			const fetchedShapeData = await fetchedShapeResponse.json();
			setActiveShapeData(fetchedShapeData);
		})();
	}, [activePatternData]);

	useEffect(() => {
		if (vehiclesListContext.data.selected) return;
		setActivePatternData(undefined);
		setActiveShapeData(undefined);
	}, [vehiclesListContext.data.selected]);

	//
	// C. Transform data

	const activePathWaypointsGeoJson = useMemo(() => {
		if (!activePatternData?.path) return;
		const collection = getBaseGeoJsonFeatureCollection();
		activePatternData.path.forEach((pathStop) => {
			const stopData = stopsContext.actions.getStopById(pathStop.stop_id);
			if (!stopData) return;
			const result = transformStopDataIntoGeoJsonFeature(stopData);
			result.properties = {
				...result.properties,
				color: activePatternData?.color,
				text_color: activePatternData?.text_color,
			};
			collection.features.push(result);
		});
		return collection;
	}, [activePatternData]);

	const activePathShapeGeoJson = useMemo(() => {
		if (!activePatternData || !activeShapeData) return;
		return { ...activeShapeData?.geojson as GeoJSON.Feature<GeoJSON.LineString>, properties: { color: activePatternData.color } };
	}, [activePatternData, activeShapeData]);

	const activeVehiclesGeoJsonFC = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection();
		if (vehiclesListContext.data.selected) {
			const vehicleGeoJsonFeature = transformVehicleDataIntoGeoJsonFeature(vehiclesListContext.data.selected);
			collection.features.push(vehicleGeoJsonFeature);
		} else {
			vehiclesListContext.data.filtered.forEach((vehicle) => {
				const vehicleGeoJsonFeature = transformVehicleDataIntoGeoJsonFeature(vehicle);
				collection.features.push(vehicleGeoJsonFeature);
			});
		}
		return collection;
	}, [vehiclesListContext.data.filtered, vehiclesListContext.data.selected, vehiclesContext.data.vehicles]);

	//
	// D. Handle actions

	function handleLayerClick(event) {
		setIsAutoZoom(false);
		if (event.features.length !== 0 && event.features[0].source === 'default-source-vehicles') {
			vehiclesListContext.actions.updateSelectedVehicle(event.features[0].properties.id);
		} else if (event.features.length !== 0 && event.features[0].source === MapViewStyleAlertsSourceId) {
			router.push(environmentContext.actions.getNormalizedHref(`/alerts/${event.features[0].properties.id}`));
		} else {
			setActivePatternData(undefined);
			setActiveShapeData(undefined);
			vehiclesListContext.actions.updateSelectedVehicle(null);
		}
	}

	function handleOnCenterMap() {
		if (!vehiclesListMap) return;
		if (!activeVehiclesGeoJsonFC?.features.length) return;
		centerMap(vehiclesListMap, activeVehiclesGeoJsonFC.features);
		setIsAutoZoom(true);
	}

	useEffect(() => {
		if (isAutoZoom) return;
		const timeout = setTimeout(() => setIsAutoZoom(true), 120_000);
		return () => clearTimeout(timeout);
	}, [isAutoZoom]);

	useEffect(() => {
		if (!isAutoZoom) return;
		if (!vehiclesListMap) return;
		if (!activeVehiclesGeoJsonFC?.features.length) return;
		centerMap(vehiclesListMap, activeVehiclesGeoJsonFC.features);
	}, [vehiclesListMap, activeVehiclesGeoJsonFC, isAutoZoom]);

	useEffect(() => {
		if (!vehiclesListMap) return;
		if (!vehiclesListContext.data.selected) return;
		const selectedVehicleFeature = activeVehiclesGeoJsonFC?.features?.[0];
		if (!selectedVehicleFeature) return;
		centerMap(vehiclesListMap, [selectedVehicleFeature]);
	}, [vehiclesListMap, vehiclesListContext.data.selected, activeVehiclesGeoJsonFC]);

	//
	// E. Render components

	return (
		<MapView
			autoZoom={isAutoZoom}
			id="vehiclesListMap"
			interactiveLayerIds={[MapViewStyleVehiclesInteractiveLayerId, MapViewStyleAlertsLayerId]}
			onCenterMap={handleOnCenterMap}
			onClick={handleLayerClick}
			onDrag={() => setIsAutoZoom(false)}
			showCenterButton={true}
		>
			<MapViewStyleVehicles showCounter="always" vehiclesData={activeVehiclesGeoJsonFC} />
			<MapViewStylePath presentBeforeId={MapViewStyleVehiclesPrimaryLayerId} shapeData={activePathShapeGeoJson} waypointsData={activePathWaypointsGeoJson} />
		</MapView>
	);

	//
}
