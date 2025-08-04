'use client';

/* * */

import { MapView } from '@/components/Map/MapView';
import { Routes } from '@/lib/routes';
import { Stop } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { Layer, Source } from '@vis.gl/react-maplibre';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function MapViewStops() {
	//

	//
	// A. Setup variables

	//
	// B. Fetch data

	const { data: stops } = useSWR<Stop[]>(Routes.ME, swrFetcher);

	//
	// C. Transform data

	const stopsAsGeojson = useMemo(() => {
		const geoJSON: GeoJSON.FeatureCollection = {
			features: [],
			type: 'FeatureCollection',
		};
		if (stops) {
			for (const stop of stops) {
				geoJSON.features.push({
					geometry: { coordinates: [stop.longitude, stop.latitude], type: 'Point' },
					properties: {},
					type: 'Feature',
				});
			}
		}
		return geoJSON;
	}, [stops]);

	//
	// D. Handle actions

	function handleMapClick(event: { features?: { properties?: { id?: number } }[] }) {
		const feature = event.features && event.features[0];
		if (!feature || !feature.properties || feature.properties.id === null || feature.properties.id === undefined) {
			return;
		}
	}

	//
	// E. Render components

	if (!stops) {
		return;
	}

	return (
		<div style={{ height: 400, width: '100%' }}>
			<MapView
				id="selectSchoolMap"
				interactiveLayerIds={['allStops']}
				onClick={handleMapClick}
				scale
				scrollZoom
				toolbar
			>
				<>
					<Source data={stopsAsGeojson} id="allStops" type="geojson">
						<Layer
							id="allStops"
							source="allStops"
							type="circle"
							paint={{
								'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#EE4B2B', '#ffdd01'],
								'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, ['case', ['boolean', ['feature-state', 'selected'], false], 5, 1], 26, ['case', ['boolean', ['feature-state', 'selected'], false], 20, 10]],
								'circle-stroke-color': '#000000',
								'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 16, 0.8, 26, 5],
							}}
						/>
					</Source>

				</>

			</MapView>
		</div>
	);

	//
}
