'use client';

import { useStopDetailContext } from '@/contexts/StopDetails.context';
/* * */

import { MapView } from '@tmlmobilidade/ui';
import { Layer, Source } from '@vis.gl/react-maplibre';
import React, { useMemo } from 'react';

/* * */

export function MapViewOneStop() {
	//
	// A. Fetch data

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const stopsAsGeojson = useMemo(() => {
		const geoJSON: GeoJSON.FeatureCollection = {
			features: [],
			type: 'FeatureCollection',
		};
		if (stopDetailContext.data.raw) {
			geoJSON.features.push({
				geometry: { coordinates: [stopDetailContext.data.raw.longitude, stopDetailContext.data.raw.latitude], type: 'Point' },
				properties: {},
				type: 'Feature',
			});
			console.log(geoJSON);
		}
		return geoJSON;
	}, [stopDetailContext.data.raw]);

	//
	// C. Render components

	if (!stopsAsGeojson) {
		return;
	}

	return (
		<div style={{ height: 400, minHeight: 400 }}>
			<MapView
				id="allStops"
				interactiveLayerIds={['allStops']}
			>
				<Source data={stopsAsGeojson} id="allStops" type="geojson">
					<Layer
						id="allStops"
						source="allStops"
						type="circle"
						paint={{
							'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#EE4B2B', '#ffdd01'],
							'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, ['case', ['boolean', ['feature-state', 'selected'], false], 5, 1], 20, ['case', ['boolean', ['feature-state', 'selected'], false], 20, 10]],
							'circle-stroke-color': '#000000',
							'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 16, 0.8, 26, 5],
						}}
					/>
				</Source>
			</MapView>
		</div>
	);
	//
}
