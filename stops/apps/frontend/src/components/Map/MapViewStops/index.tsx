'use client';

/* * */

import { MapView } from '@/components/Map/MapView';
import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useSWR from 'swr';

/* * */

export function MapViewStops({ allSchoolsData, onSelectSchool }) {
	//

	//
	// A. Setup variables

	//
	// B. Fetch data

	const { data: allStopsData } = useSWR('https://api.carrismetropolitana.pt/stops');

	//
	// C. Transform data

	const allStopsDataAsGeojson = useMemo(() => {
		const geoJSON: GeoJSON.FeatureCollection = {
			features: [],
			type: 'FeatureCollection',
		};
		if (allStopsData) {
			for (const stop of allStopsData) {
				geoJSON.features.push({
					geometry: { coordinates: [stop.lon, stop.lat], type: 'Point' },
					properties: {},
					type: 'Feature',
				});
			}
		}
		return geoJSON;
	}, [allStopsData]);

	//
	// D. Handle actions

	function handleMapClick(event: { features?: { properties?: { id?: number } }[] }) {
		const feature = event.features && event.features[0];
		if (!feature || !feature.properties || feature.properties.id === null || feature.properties.id === undefined) {
			return;
		}
		const id = feature.properties.id;
		onSelectSchool(id);
		console.log('finally work');
	}

	//
	// E. Render components

	if (!allSchoolsData || !allStopsData) {
		return;
	}

	return (
		<div style={{ height: 400, width: '100%' }}>
			<MapView
				id="selectSchoolMap"
				interactiveLayerIds={['allSchools']}
				onClick={handleMapClick}
				scale
				scrollZoom
				toolbar
			>
				<>
					<Source data={allStopsDataAsGeojson} id="allStops" type="geojson">
						<Layer
							id="allStops"
							source="allStops"
							type="circle"
							paint={{
								'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#EE4B2B', '#ffdd01'],
								'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, ['case', ['boolean', ['feature-state', 'selected'], false], 5, 1], 26, ['case', ['boolean', ['feature-state', 'selected'], false], 20, 10]],
								'circle-stroke-color': '#000000',
								'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 26, 10],
							}}
						/>
					</Source>

				</>

			</MapView>
		</div>
	);

	//
}
