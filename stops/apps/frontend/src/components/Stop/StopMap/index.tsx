import { transformStopDataIntoGeoJsonFeature } from '@/contexts/Stops.context';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { centerMap, getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { useMap } from '@vis.gl/react-maplibre';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffect, useMemo } from 'react';

import { MapView } from './map/MapView';
import { MapViewStyleActiveStops, MapViewStyleActiveStopsPrimaryLayerId } from './map/MapViewStyleActiveStops';
import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from './map/MapViewStyleStops';

/* * */

export function StopsListViewMap({ data, generic = false, getStopById }) {
	//

	//
	// A. Setup variables

	const { stopsListMap } = useMap();
	const router = useRouter();
	const stopsListContext = useStopsListContext();

	//
	// B. Handle actions

	const getStopByIdGeoJsonFC = (stopId: string): GeoJSON.FeatureCollection | undefined => {
		const stop = getStopById(stopId);
		if (!stop) return;
		const collection = getBaseGeoJsonFeatureCollection();
		const stopFC = transformStopDataIntoGeoJsonFeature(stop);
		if (stopFC) collection.features.push(stopFC);
		return collection;
	};

	const activeStopGeoJson = useMemo(() => {
		const geoJson = getStopByIdGeoJsonFC(data.active_stop_id);
		centerMap(stopsListMap, geoJson ? geoJson.features : []);
		return geoJson;
	}, [stopsListContext.data.filtered_fc, data.active_stop_id]);

	const handleLayerClick = (event) => {
		if (!stopsListMap) return;
		const features = stopsListMap.queryRenderedFeatures(event.point);
		if (!features.length) return;
		for (const feature of features) {
			if (feature.layer.id === MapViewStyleStopsInteractiveLayerId) {
				router.push(`/stops/${feature.properties.id}`);
				return;
			}
		}
	};

	useEffect(() => {
		const geoJson = getStopByIdGeoJsonFC(data.active_stop_id);
		centerMap(stopsListMap, geoJson ? geoJson.features : []);
	});

	//
	// C. Render components

	return (
		<div style={{ height: generic ? '90vh' : 400, minHeight: 400 }}>
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
