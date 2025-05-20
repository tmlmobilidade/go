// import { Surface } from '@/components/layout/Surface';
// import { MapView } from '@/components/map/MapView';
// import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from '@/components/map/MapViewStyleStops';

import { Stop } from '@tmlmobilidade/types';
// import { centerMap, getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/ui';
// import { centerMap, getBaseGeoJsonFeatureCollection, MapView, MapViewStyleActiveStops, MapViewStyleStops, MapViewStyleStopsInteractiveLayerId, MapViewStyleVehiclesPrimaryLayerId, moveMap } from '@tmlmobilidade/ui';
// import { centerMap } from '@/utils/map.utils';
import { transformStopDataIntoGeoJsonFeature } from '@/contexts/Stops.context';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { centerMap, getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import * as turf from '@turf/turf';
import { useMap } from '@vis.gl/react-maplibre';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffect, useMemo } from 'react';

import { MapView } from './map/MapView';
import { MapViewStyleActiveStops, MapViewStyleActiveStopsPrimaryLayerId } from './map/MapViewStyleActiveStops';
import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from './map/MapViewStyleStops';

/* * */

export function StopsListViewMap({ data, generic = false }) {
	console.log('StopsListViewMap');
	//

	//
	// A. Setup variables

	const { stopsListMap } = useMap();
	const router = useRouter();
	const stopsListContext = useStopsListContext();

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
		const geoJson = getGeoJsonFC(data.form.values);
		centerMap(stopsListMap, geoJson ? geoJson.features : []);
		return geoJson;
	// }, [stopDetailContext.data.active_stop_id]);
	// }, [stopsListContext.data.filtered_fc, data.active_stop_id]);
	}, [stopsListContext.data.filtered_fc]);

	// useEffect(() => {
	// 	console.log('UseEffect', stopsListContext.data.filtered_fc);
	// 	const geoJsonFC = getGeoJsonFC(data.form.values);
	// 	// centerMap(stopsListMap, geoJsonFC ? geoJsonFC.features : []);
	// }, [stopsListContext.data.filtered_fc]);
	// // }, [stopsListContext.data.filtered_fc, stopDetailContext.data.active_stop_id]);

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
		// centerMap(stopsListMap, filteredClusterPoints);
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
	console.log('-> activeStopGeoJson', activeStopGeoJson);
	return (
		<div style={{ height: generic ? 400 : '90vh', minHeight: 400 }}>
			<MapView
				id="stopsListMap"
				interactiveLayerIds={[MapViewStyleStopsInteractiveLayerId]}
				onClick={handleLayerClick}
			>
				<MapViewStyleActiveStops
					stopsData={activeStopGeoJson}
				/>

				<MapViewStyleStops
					presentBeforeId={MapViewStyleActiveStopsPrimaryLayerId}
					stopsData={stopsListContext.data.filtered_fc}
				/>
			</MapView>
		</div>
	);
}
