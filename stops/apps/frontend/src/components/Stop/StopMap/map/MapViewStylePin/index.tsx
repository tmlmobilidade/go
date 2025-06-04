'use client';

/* * */

import { getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

export const MapViewStylePinPrimaryLayerId = 'default-layer-pinned-stop';

/* * */

interface Props {
	presentBeforeId?: string
	stopsData?: GeoJSON.FeatureCollection
}

/* * */

const baseGeoJsonFeatureCollection = getBaseGeoJsonFeatureCollection();

/* * */

export function MapViewStylePin({ presentBeforeId, stopsData = baseGeoJsonFeatureCollection }: Props) {
	return (
		<Source data={stopsData} generateId={true} id="selected-coordinates" type="geojson">
			<Layer
				beforeId={presentBeforeId}
				id={MapViewStylePinPrimaryLayerId}
				source="selected-coordinates"
				type="symbol"
				layout={{
					'icon-allow-overlap': true,
					'icon-anchor': 'bottom',
					'icon-ignore-placement': true,
					'icon-image': 'cmet-pin',
					'icon-offset': [0, 5],
					'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.25, 20, 0.35],
					'symbol-placement': 'point',
				}}
				paint={{
					'icon-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 10, 1],
				}}
			/>
		</Source>
	);
}
