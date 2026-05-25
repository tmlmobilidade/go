'use client';

import { Layer, Source } from '@vis.gl/react-maplibre';
import { FeatureCollection, type Polygon } from 'geojson';
import { useEffect } from 'react';

import { useMapViewContext } from '../../view/MapViewContext';

/* * */

export interface MapOverlayPolygonDataProps {
	id: string
}

export interface MapOverlayPolygonProps {
	color?: string
	data: FeatureCollection<Polygon, MapOverlayPolygonDataProps>
	fillOpacity?: number
	id: string
	lineOpacity?: number
	lineWidth?: number
	/**
	 * When false, this polygon is still drawn but is omitted from {@link MapViewContext}'s
	 * auto-fit bounds (e.g. a world-sized “dim outside” mask should not reset zoom).
	 */
	registerForAutoZoom?: boolean
	visible?: boolean
}

export function MapOverlayPolygon({
	color = '#000000',
	data,
	fillOpacity = 0.3,
	id,
	lineOpacity = 1,
	lineWidth = 3,
	registerForAutoZoom = true,
	visible = true,
}: MapOverlayPolygonProps) {
	//

	//
	// A. Setup variables

	const mapViewContext = useMapViewContext();

	//
	// B. Handle actions

	useEffect(() => {
		if (!data || !registerForAutoZoom) return;
		const sourceKey = `${id}:polygon:source`;
		mapViewContext.actions.registerOverlaySource(sourceKey, data);
		return () => {
			mapViewContext.actions.unregisterOverlaySource(sourceKey);
		};
	}, [data, id, registerForAutoZoom, mapViewContext.actions]);

	//
	// C. Render components

	if (!data) return null;

	return (
		<Source data={data} id={`${id}:polygon:source`} type="geojson" generateId>
			<Layer
				id={`${id}:polygon:layer:fill`}
				layout={{ visibility: visible ? 'visible' : 'none' }}
				paint={{ 'fill-color': color, 'fill-opacity': fillOpacity }}
				source={`${id}:polygon:source`}
				type="fill"
			/>
			<Layer
				id={`${id}:polygon:layer:border`}
				layout={{ visibility: visible ? 'visible' : 'none' }}
				paint={{ 'line-color': color, 'line-opacity': lineOpacity, 'line-width': lineWidth }}
				source={`${id}:polygon:source`}
				type="line"
			/>
		</Source>
	);
}
