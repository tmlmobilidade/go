'use client';

import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

export const MapViewOverlayStopsPrimaryLayerId = 'default-layer-stops-all';
export const MapViewOverlayStopsInteractiveLayerId = 'default-layer-stops-regular';

/* * */

interface MapViewOverlayStopsProps {
	presentBeforeId?: string
	stopsData?: GeoJSON.FeatureCollection
	visible?: boolean
}

/* * */

const baseGeoJsonFeatureCollection = getBaseGeoJsonFeatureCollection();

/* * */

export function MapViewOverlayStops({ presentBeforeId, stopsData = baseGeoJsonFeatureCollection, visible = true }: MapViewOverlayStopsProps) {
	return (
		<Source data={stopsData} generateId={true} id="default-source-stops-all" type="geojson">

			<Layer
				beforeId={presentBeforeId}
				id="default-layer-stops-regular"
				source="default-source-stops-all"
				type="symbol"
				layout={{
					'icon-allow-overlap': true,
					'icon-anchor': 'center',
					'icon-ignore-placement': true,
					'icon-image': 'map-navegante-stop-bus-idle',
					'icon-offset': [0, 0],
					'icon-size': [
						'interpolate',
						['linear'],
						['zoom'],
						14,
						0.1,
						20,
						0.75,
					],
					'symbol-placement': 'point',
					'visibility': visible ? 'visible' : 'none',
				}}
				paint={{
					'icon-opacity': [
						'interpolate',
						['linear'],
						['zoom'],
						14,
						0,
						15,
						1,
					],
				}}
			/>

		</Source>
	);
}
