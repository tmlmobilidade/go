'use client';

import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

/* * */

interface MapViewGeoJsonProps {
	color: string
	data: GeoJSON.Feature
	fillOpacity?: number
	id: string
	lineOpacity?: number
	lineWidth?: number
}

export default function MapViewGeoJson({ color, data, fillOpacity = 0.3, id, lineOpacity = 1, lineWidth = 3 }: MapViewGeoJsonProps) {
	//

	//
	return (
		<Source data={data} id={id} type="geojson">
			<Layer paint={{ 'fill-color': color, 'fill-opacity': fillOpacity }} type="fill" />
			<Layer paint={{ 'line-color': color, 'line-opacity': lineOpacity, 'line-width': lineWidth }} type="line" />
		</Source>
	);
}
