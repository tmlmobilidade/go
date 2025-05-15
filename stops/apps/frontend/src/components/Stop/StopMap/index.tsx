// import { Surface } from '@/components/layout/Surface';
// import { MapView } from '@/components/map/MapView';
// import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from '@/components/map/MapViewStyleStops';

import { Stop } from '@tmlmobilidade/types';
// import { centerMap, getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/ui';
// import { centerMap, getBaseGeoJsonFeatureCollection, MapView, MapViewStyleActiveStops, MapViewStyleStops, MapViewStyleStopsInteractiveLayerId, MapViewStyleVehiclesPrimaryLayerId, moveMap } from '@tmlmobilidade/ui';
// import { centerMap } from '@/utils/map.utils';
import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { transformStopDataIntoGeoJsonFeature } from '@/contexts/Stops.context';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { centerMap, getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import * as turf from '@turf/turf';
import { useMap } from '@vis.gl/react-maplibre';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffect, useMemo } from 'react';

import { MapView } from './map/MapView';
import { MapViewStyleActiveStops } from './map/MapViewStyleActiveStops';
import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from './map/MapViewStyleStops';

/* * */

export function StopsListViewMap() {
	console.log('StopsListViewMap');
	//

	//
	// A. Setup variables

	const { stopsListMap } = useMap();
	const router = useRouter();
	const stopsListContext = useStopsListContext();
	const stopDetailContext = useStopDetailContext();

	// console.log('stopsListMap', stopsListMap);

	// const [activeStopGeoJson, setActiveStopGeoJson] = React.useState<GeoJSON.FeatureCollection | undefined>(undefined);

	//
	// B. Handle actions

	const getGeoJsonFC = (stop: Stop): GeoJSON.FeatureCollection | undefined => {
		if (!stop) return;
		const collection = getBaseGeoJsonFeatureCollection();
		const stopFC = transformStopDataIntoGeoJsonFeature(stop);
		// console.log('stopFC', stopFC);
		if (stopFC) collection.features.push(stopFC);
		// console.log('collection', collection);
		return collection;
	};

	const activeStopGeoJson = useMemo(() => {
		// console.log('activeStopGeoJson');
		// console.log('stopDetailContext.data.form.values', stopDetailContext.data.form.values);
		return getGeoJsonFC(stopDetailContext.data.form.values);
	// }, [stopDetailContext.data.active_stop_id]);
	}, [stopsListContext.data.filtered_fc, stopDetailContext.data.active_stop_id]);

	useEffect(() => {
		console.log('UseEffect', stopsListContext.data.filtered_fc);
		// console.log('stopDetailContext.data.form.values', stopDetailContext.data.form.values);
		const geoJsonFC = getGeoJsonFC(stopDetailContext.data.form.values);
		// moveMap(stopsListMap, geoJsonFC ? geoJsonFC.features : []);
		centerMap(stopsListMap, geoJsonFC ? geoJsonFC.features : []);
		// setActiveStopGeoJson(geoJsonFC);
	}, [stopsListContext.data.filtered_fc]);
	// }, [stopsListContext.data.filtered_fc, stopDetailContext.data.active_stop_id]);

	useEffect(() => {
		// Exit early if there are no stops or map
		if (!stopsListContext.data.filtered_fc || !stopsListContext.data.filtered_fc.features.length || !stopsListMap) return;
		// When there are no search filters, center the map on all stops
		// if (!stopsListContext.filters.by_search.length) {
		// 	centerMap(stopsListMap, stopsListContext.data.filtered_fc.features);
		// 	return;
		// }
		// When there are search filters, center the map on the cluster with the most points
		const clusterPoints = turf.clustersKmeans(stopsListContext.data.filtered_fc, { mutate: true, numberOfClusters: 2 });
		const clusterPointsCount = clusterPoints.features.reduce((acc, feature) => {
			if (typeof feature.properties.cluster !== 'number') return acc;
			const clusterId = feature.properties.cluster;
			if (!acc[clusterId]) acc[clusterId] = 0;
			acc[clusterId]++;
			return acc;
		}, {});
		const clusterId = Object.keys(clusterPointsCount).reduce((a, b) => (clusterPointsCount[a] > clusterPointsCount[b] ? a : b));
		const filteredClusterPoints = clusterPoints.features.filter(feature => feature.properties.cluster === Number(clusterId));
		centerMap(stopsListMap, filteredClusterPoints);
		//
	}, [stopsListContext.data.filtered_fc, stopsListMap]);

	function handleLayerClick(event) {
		if (!stopsListMap) return;
		const features = stopsListMap.queryRenderedFeatures(event.point);
		if (!features.length) return;
		for (const feature of features) {
			if (feature.layer.id === MapViewStyleStopsInteractiveLayerId) {
				router.push(`/stops/${feature.properties.id}`);
				return;
			}
		}
	}

	//
	// C. Render components

	return (
		<div style={{ height: 400, minHeight: 400 }}>
			<MapView
				id="stopsListMap"
				interactiveLayerIds={[MapViewStyleStopsInteractiveLayerId]}
				onClick={handleLayerClick}
			>
				<MapViewStyleActiveStops
					presentBeforeId={MapViewStyleStopsInteractiveLayerId}
					stopsData={activeStopGeoJson}
				/>

				<MapViewStyleStops stopsData={stopsListContext.data.filtered_fc} />
			</MapView>
		</div>
	);
}
