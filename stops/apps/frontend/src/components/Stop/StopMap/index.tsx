import { transformStopDataIntoGeoJsonFeature, useStopsContext } from '@/contexts/Stops.context';
import { useStopsListContext } from '@/contexts/StopsList.context';
// import { municipalities } from '../../../data/municipalities.json';
import { centerMap, getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { useMap } from '@vis.gl/react-maplibre';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useEffect, useMemo } from 'react';
// import useSWR from 'swr';
import * as turf from '@turf/turf';

// import municipalities from '../../../data/municipalities.json';
// import localities from '../../../data/localities.json';
// import parishes from '../../../data/parishes.json';
import { useStopsDetailContext } from '@/contexts/StopsDetail.context';

import { MapView } from './map/MapView';
import { MapViewStyleActiveStops } from './map/MapViewStyleActiveStops';
import { MapViewStylePin } from './map/MapViewStylePin';
import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from './map/MapViewStyleStops';

/* * */

export function StopsListViewMap({ generic = false, isCreateAction = false }) {
	//

	//
	// A. Setup variables

	// const fetcher = url => fetch(url).then(res => res.json());
	const stopsDetailContext = useStopsDetailContext();
	const stopsContext = useStopsContext();
	const { stopsListMap } = useMap();
	const router = useRouter();
	const stopsListContext = useStopsListContext();
	const [pinnedStopGeoJson, setPinnedStopGeoJson] = useState(getBaseGeoJsonFeatureCollection());
	const [municipalityDataForThisStop, setMunicipalityDataForThisStop] = useState(null);
	// const { data: municipalities, error } = useSWR('/municipalities.json', fetcher);
	// stops / apps / frontend / src / data / municipalities.json;
	// stops / apps / frontend / src / components / Stop / StopMap / index.tsx;
	//
	// B. Handle actions

	const getStopByIdGeoJsonFC = (stopId: string): GeoJSON.FeatureCollection | undefined => {
		const stop = stopsContext.actions.getStopById(stopId);
		if (!stop) return;
		const collection = getBaseGeoJsonFeatureCollection();
		const stopFC = transformStopDataIntoGeoJsonFeature(stop);
		if (stopFC) collection.features.push(stopFC);
		return collection;
	};

	const activeStopGeoJson = useMemo(() => {
		const geoJson = getStopByIdGeoJsonFC(stopsDetailContext.data.active_stop_id);
		centerMap(stopsListMap, geoJson ? geoJson.features : []);
		return geoJson;
	}, [stopsListContext.data.filtered_fc, stopsDetailContext.data.active_stop_id]);

	const getPinnedStopGeoJson = (longitude, latitude) => {
		const collection = getBaseGeoJsonFeatureCollection();
		const stopFC: GeoJSON.Feature<GeoJSON.Point> = {
			geometry: {
				coordinates: [longitude, latitude],
				type: 'Point',
			},
			properties: {
				current_status: 'temp',
				id: 'temp',
				lat: latitude,
				lon: longitude,
				long_name: 'temp',
			},
			type: 'Feature',
		};
		collection.features.push(stopFC);
		return collection;
	};

	const handleLayerClickSelectStop = (event) => {
		console.log('event', event);
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

	const handleLayerClickCreateStop = (event) => {
		if (!stopsListMap) return;
		stopsDetailContext.data.form.setFieldValue('latitude', event.lngLat.lat);
		stopsDetailContext.data.form.setFieldValue('longitude', event.lngLat.lng);
		setPinnedStopGeoJson(getPinnedStopGeoJson(event.lngLat.lng, event.lngLat.lat));

		fetch('/data/municipalities.json').then(res => res.json()).then((municipalities) => {
			// console.log("response", response);

			let foundMunicipality = null;
			for (const municipalityData of municipalities.features) {
				// console.log('municipalityData', municipalityData);
				// Skip if no geometry is set for this municipality
				if (!municipalityData.geometry?.coordinates.length) continue;
				console.log('HERE!');
				// Check if this stop is inside this municipality boundary
				const isStopInThisMunicipality = turf.booleanPointInPolygon([event.lngLat.lng, event.lngLat.lat], municipalityData.geometry);
				// If it is, add this municipality id to the stop
				if (isStopInThisMunicipality) {
					console.log('FOUND!');
					foundMunicipality = municipalityData;
					break;
				}
			}
			console.log('MUNI!', foundMunicipality);
			setMunicipalityDataForThisStop(foundMunicipality);

			if (foundMunicipality) {
				stopsDetailContext.data.form.setFieldValue('municipality_id', foundMunicipality.properties.id);
				stopsDetailContext.data.form.setFieldValue('district_id', foundMunicipality.properties.district_id);

				fetch('/data/localities.json').then(res => res.json()).then((localities) => {
					for (const localitiesData of localities.features) {
						if (localitiesData.properties.municipality_id === foundMunicipality.id) {
							stopsDetailContext.data.form.setFieldValue('locality_id', localitiesData.id);
							break;
						}
					}
				});

				fetch('/data/parishes.json').then(res => res.json()).then((parishes) => {
					for (const parishesData of parishes.features) {
						if (parishesData.properties.municipality_id === foundMunicipality.id) {
							stopsDetailContext.data.form.setFieldValue('parish_id', parishesData.id);
							break;
						}
					}
				});
			}
		});
	};

	useEffect(() => {
		const geoJson = getStopByIdGeoJsonFC(stopsDetailContext.data.active_stop_id);
		centerMap(stopsListMap, geoJson ? geoJson.features : []);
	});

	//
	// C. Render components

	return (
		<div style={{ height: generic ? '90vh' : 400, minHeight: 400 }}>
			<MapView
				id="stopsListMap"
				interactiveLayerIds={[MapViewStyleStopsInteractiveLayerId]}
				onClick={isCreateAction ? handleLayerClickCreateStop : handleLayerClickSelectStop}
			>
				{!isCreateAction && (
					<MapViewStyleActiveStops
						stopsData={activeStopGeoJson}
					/>
				)}

				<MapViewStyleStops
					// presentBeforeId={MapViewStyleActiveStopsPrimaryLayerId}
					stopsData={stopsListContext.data.filtered_fc}
				/>

				{isCreateAction && (
					<MapViewStylePin
						// presentBeforeId={MapViewStyleStopsPrimaryLayerId}
						stopsData={pinnedStopGeoJson}
					/>
				)}

			</MapView>
		</div>
	);
}
