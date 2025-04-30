'use client';

/* * */

import type { FeatureCollection } from 'geojson';

/* * */

import { MapView, MapViewStyleStops, MapViewStyleStopsInteractiveLayerId, Surface, useMap } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import * as React from 'react';

/* * */

import styles from './styles.module.css';

/* * */

interface MapperProps {
	generic?: boolean
}

/* * */

export default function Mapper({ generic }: MapperProps) {
	//

	//
	// A. Render components

	const { stopsListMap } = useMap();
	const router = useRouter();
	// const stopsListContext = useStopsListContext();

	//
	// B. Handle actions

	// useEffect(() => {
	//     // Exit early if there are no stops or map
	//     if (!stopsListContext.data.filtered_fc || !stopsListContext.data.filtered_fc.features.length || !stopsListMap) return;
	//     // When there are no search filters, center the map on all stops
	//     if (!stopsListContext.filters.by_search.length) {
	//         centerMap(stopsListMap, stopsListContext.data.filtered_fc.features);
	//         return;
	//     }
	//     // When there are search filters, center the map on the cluster with the most points
	//     const clusterPoints = turf.clustersKmeans(stopsListContext.data.filtered_fc, { mutate: true, numberOfClusters: 2 });
	//     const clusterPointsCount = clusterPoints.features.reduce((acc, feature) => {
	//         if (typeof feature.properties.cluster !== 'number') return acc;
	//         const clusterId = feature.properties.cluster;
	//         if (!acc[clusterId]) acc[clusterId] = 0;
	//         acc[clusterId]++;
	//         return acc;
	//     }, {});
	//     const clusterId = Object.keys(clusterPointsCount).reduce((a, b) => (clusterPointsCount[a] > clusterPointsCount[b] ? a : b));
	//     const filteredClusterPoints = clusterPoints.features.filter(feature => feature.properties.cluster === Number(clusterId));
	//     console.log('filteredClusterPoints', filteredClusterPoints);
	//     centerMap(stopsListMap, filteredClusterPoints);
	//     //
	// }, [stopsListContext.data.filtered_fc, stopsListMap]);

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

	const myFeatureCollection: FeatureCollection = {
		features: [
			{
				geometry: {
					coordinates: [-8.9595566, 38.7542436],
					type: 'Point',
				},
				properties: {
					name: 'Sample Point',
				},
				type: 'Feature',
			},
			{
				geometry: {
					coordinates: [
						[-8.9595566, 38.7542436],
						[103.0, 1.0],
						[104.0, 0.0],
						[105.0, 1.0],
					],
					type: 'MultiPoint',
				},
				properties: {
					name: 'Sample Line',
				},
				type: 'Feature',
			},
		],
		type: 'FeatureCollection',
	};

	// const MapViewStyleStopsInteractiveLayerId = "6476b094424adb51586dfcee";
	return (
		<div className={generic ? styles.containerGeneric : styles.containerSpecific}>
			<MapView
				id="stopsListMap"
				interactiveLayerIds={[MapViewStyleStopsInteractiveLayerId]}
				onClick={handleLayerClick}
			>
				<MapViewStyleStops stopsData={myFeatureCollection} />
				{/* <MapViewStyleStops stopsData={stopsListContext.data.filtered_fc} /> */}
			</MapView>
		</div>
	);
}
