/* * */

import * as turf from '@turf/turf';
import { type MapRef } from '@vis.gl/react-maplibre';
import { type Position } from 'geojson';

/* * */

const MOVE_SETTINGS = {
	speed: 4000,
	zoom: 12,
	zoom_margin: 3,
};

/**
 *
 * @param mapObject The map that should be manipulated.
 * @param coordinates The destination coordinates to move the map to.
 * @param options Optional settings to customize the movement.
 */
export function moveMapView(mapObject: MapRef, coordinates: Position) {
	//

	//
	// Validate the input parameters

	if (!mapObject) return;

	if (coordinates?.length !== 2) return;
	if (typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') return;

	//
	// Get current zoom level and calculate the zoom thresholds

	const currentZoom = mapObject.getZoom();
	const currentZoomWithMargin = currentZoom + MOVE_SETTINGS.zoom_margin;
	const thresholdZoomWithMargin = MOVE_SETTINGS.zoom + MOVE_SETTINGS.zoom_margin;

	//
	// Get and validate the map bounds

	const mapBounds = mapObject.getBounds().toArray();

	if (!mapBounds || mapBounds.length < 2) return;
	if (mapBounds[0]?.length !== 2 || mapBounds[1]?.length !== 2) return;

	//
	// Check if the given coordinates are
	// inside the currently rendered map bounds

	const point = turf.point(coordinates);
	const bbox = turf.bboxPolygon([...mapBounds[0], ...mapBounds[1]]);

	const isVisible = turf.booleanIntersects(point, bbox);

	//
	// If the given coordinates are visible and the zoom
	// is not too far back (plus a little margin)...

	if (isVisible && currentZoomWithMargin > (thresholdZoomWithMargin * 1.15)) {
		// ...then simply ease to it.
		mapObject.easeTo({
			center: { lat: coordinates[1], lng: coordinates[0] },
			duration: MOVE_SETTINGS.speed * 0.25,
			zoom: currentZoom,
		});
	} else {
		// If the zoom is too far, or the given coordinates
		// are not visible, then fly to it.
		mapObject.flyTo({
			center: { lat: coordinates[1], lng: coordinates[0] },
			duration: MOVE_SETTINGS.speed,
			zoom: thresholdZoomWithMargin,
		});
	}

	//
};
