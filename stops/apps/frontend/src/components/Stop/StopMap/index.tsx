/* * */

// import { Surface } from '@/components/layout/Surface';
// import { MapView } from '@/components/map/MapView';
// import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from '@/components/map/MapViewStyleStops';
// import { useStopsListContext } from '@/contexts/StopsList.context';
// import { centerMap } from '@/utils/map.utils';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { centerMap, MapView, MapViewStyleStops, MapViewStyleStopsInteractiveLayerId, Surface } from '@tmlmobilidade/ui';
import * as turf from '@turf/turf';
import { useMap } from '@vis.gl/react-maplibre';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/* * */

export function StopsListViewMap() {
	//

	//
	// A. Setup variables

	const { stopsListMap } = useMap();
	const router = useRouter();
	const stopsListContext = useStopsListContext();

	console.log('stopsListContext', stopsListContext.data);
	//
	// B. Handle actions

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
		console.log('handleLayerClick', event);
		console.log('stopsListMap', stopsListMap);
		if (!stopsListMap) return;
		const features = stopsListMap.queryRenderedFeatures(event.point);
		console.log('features', features);
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
		// <Surface variant="persistent" forceOverflow>
		// <Surface>
		<div style={{ height: 600, minHeight: 600 }}>
			<MapView
				id="stopsListMap"
				interactiveLayerIds={[MapViewStyleStopsInteractiveLayerId]}
				onClick={handleLayerClick}
			>
				<MapViewStyleStops stopsData={stopsListContext.data.filtered_fc} />
			</MapView>
		</div>
		// </Surface>
	);

	//
}
