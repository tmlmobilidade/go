'use client';

import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

export const MapViewStyleStopsPrimaryLayerId = 'default-layer-stops-all';
export const MapViewStyleStopsInteractiveLayerId = 'default-layer-stops-regular';

/* * */

interface Props {
	presentBeforeId?: string
	stopsData?: GeoJSON.FeatureCollection
	visible?: boolean
}

/* * */

const baseGeoJsonFeatureCollection = getBaseGeoJsonFeatureCollection();

/* * */

export function MapViewStyleStops({ presentBeforeId, stopsData = baseGeoJsonFeatureCollection, visible = true }: Props) {
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

			{/* <Layer
				beforeId="default-layer-stops-regular"
				id="default-layer-stops-circle"
				source="default-source-stops-all"
				type="circle"
				layout={{
					visibility: visible ? 'visible' : 'none',
				}}
				paint={{
					'circle-color': '#ffffff',
					'circle-pitch-alignment': 'map',
					'circle-radius': [
						'interpolate',
						['linear'],
						['zoom'],
						9,
						['case', ['boolean', ['feature-state', 'active'], false], 5, 1],
						26,
						['case', ['boolean', ['feature-state', 'active'], false], 25, 20],
					],
					'circle-stroke-color': '#ffffff',
					'circle-stroke-width': [
						'interpolate',
						['linear'],
						['zoom'],
						9,
						0.01,
						26,
						['case', ['boolean', ['feature-state', 'active'], false], 8, 7],
					],
				}}
			/> */}

		</Source>
	);
}
