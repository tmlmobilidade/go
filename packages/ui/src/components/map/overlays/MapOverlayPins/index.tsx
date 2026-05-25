'use client';

import { Layer, Source } from '@vis.gl/react-maplibre';
import { type FeatureCollection, type Point } from 'geojson';
import { useEffect } from 'react';

import { useMapContext } from '../../../../contexts';
import { centerMapView } from '../../utils/center-map-view';
import { moveMapView } from '../../utils/move-map-view';
import { useMapViewContext } from '../../view/MapViewContext';

/* * */

export interface MapOverlayPinsPointDataProps {
	id: string
}

/* * */

interface MapOverlayPinsProps {
	focusOnChange?: boolean
	id: string
	pinsData?: FeatureCollection<Point, MapOverlayPinsPointDataProps> | null
	visible?: boolean
}

/* * */

export function MapOverlayPins({ focusOnChange, id, pinsData, visible = true }: MapOverlayPinsProps) {
	//

	//
	// A. Setup variables

	const mapContext = useMapContext();
	const mapViewContext = useMapViewContext();

	//
	// B. Handle actions

	useEffect(() => {
		// Register features for sources in this overlay component
		if (pinsData) mapViewContext.actions.registerOverlaySource(`${id}:pins:source:points`, pinsData);
		return () => {
			mapViewContext.actions.unregisterOverlaySource(`${id}:pins:source:points`);
		};
	}, [pinsData]);

	useEffect(() => {
		// Skip if focus on change is disabled
		if (!focusOnChange) return;
		// Skip if no map is available
		if (!mapViewContext.ref.map.current) return;
		// Skip if no search pin coordinates are available
		if (!mapContext.data.search_pin?.features.length) return;
		// Disable auto zoom (to prevent collisions)
		mapViewContext.actions.toggleAutoZoom(false);
		// If there is more than one feature, center the map on them
		if (mapContext.data.search_pin.features.length > 1) {
			centerMapView(mapViewContext.ref.map.current, mapContext.data.search_pin.features);
		}
		// If there is only one feature, move the map to it
		else if (mapContext.data.search_pin.features[0]) {
			moveMapView(mapViewContext.ref.map.current, mapContext.data.search_pin.features[0].geometry.coordinates);
		}
	}, [pinsData]);

	//
	// C. Render components

	if (!pinsData) {
		return null;
	}

	return (
		<Source data={pinsData} id={`${id}:pins:source:points`} type="geojson" generateId>
			<Layer
				id={`${id}:pins:layer:points`}
				source={`${id}:pins:source:points`}
				type="symbol"
				layout={{
					'icon-allow-overlap': true,
					'icon-anchor': 'bottom',
					'icon-ignore-placement': true,
					'icon-image': 'map-pin',
					'icon-offset': [0, 0],
					'icon-pitch-alignment': 'viewport',
					'icon-rotate': 0,
					'icon-size': [
						'interpolate',
						['linear'],
						['zoom'],
						10, // min zoom level
						0.1, // min radius
						25, // max zoom level
						0.7, // max radius
					],
					'symbol-placement': 'point',
					'visibility': visible ? 'visible' : 'none',
				}}
				paint={{
					'icon-color': '#ffffff',
					'icon-opacity': 1,
				}}
			/>
		</Source>
	);

	//
}
