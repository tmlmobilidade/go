'use client';

/* * */

import { useStopsListContext } from '@/contexts/StopsList.context';
import { type Stop } from '@tmlmobilidade/types';
import { MapView, Pane } from '@tmlmobilidade/ui';
import { Layer, Source } from '@vis.gl/react-maplibre';
import { useMemo } from 'react';

/* * */

export function StopsListMap() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();

	//
	// B. Transform data

	const stopsAsGeojson: GeoJSON.FeatureCollection = useMemo(() => {
		return {
			features: stopsListContext.data.filtered.map((stop: Stop) => ({
				geometry: { coordinates: [stop.longitude, stop.latitude], type: 'Point' },
				properties: {},
				type: 'Feature',
			})),
			type: 'FeatureCollection',
		};
	}, [stopsListContext.data.filtered]);

	//
	// C. Render components

	return (
		<Pane>
			<MapView
				id="stops-list"
				interactiveLayerIds={['allStops']}
			>
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
			</MapView>
		</Pane>
	);

	//
}
