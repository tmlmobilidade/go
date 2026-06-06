/* * */

import * as turf from '@turf/turf';
import { type MapRef } from '@vis.gl/react-maplibre';
import { type Position } from 'geojson';

/* * */

interface MoveMapViewOptions {
	bearing?: number
	padding?: number
	speed?: number
	zoom?: number
}

const DEFAULT_OPTIONS: MoveMapViewOptions = {
	padding: 3,
	speed: 4000,
	zoom: 12,
};

/**
 *
 * @param mapObject The map that should be manipulated.
 * @param coordinates The destination coordinates to move the map to.
 * @param options Optional settings to customize the movement.
 */
export function moveMapView(mapObject: MapRef, coordinates: Position, options?: MoveMapViewOptions) {
	//

	//
	// Validate the input parameters

	if (!mapObject) return;

	if (coordinates?.length !== 2) return;
	if (typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') return;

	//
	// Override default options with the given options

	options = { ...DEFAULT_OPTIONS, ...options };

	//
	// Get current zoom level and calculate the zoom thresholds

	const currentZoom = mapObject.getZoom();
	const currentZoomWithMargin = currentZoom + options.padding;
	const thresholdZoomWithMargin = options.zoom + options.padding;
	const currentBearing = mapObject.getBearing();

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
	// Check if the movement should be aborted

	if (mapObject.isMoving() || mapObject.isEasing() || mapObject.isZooming()) mapObject.stop();

	//
	// If the given coordinates are visible and the zoom
	// is not too far back (plus a little margin)...

	if (isVisible && currentZoomWithMargin > (thresholdZoomWithMargin * 1.15)) {
		// ...then simply ease to it.
		mapObject.easeTo({
			bearing: options.bearing ?? currentBearing,
			center: { lat: coordinates[1], lng: coordinates[0] },
			duration: options.speed * 0.25,
			zoom: thresholdZoomWithMargin,
		});
	} else {
		// If the zoom is too far, or the given coordinates
		// are not visible, then fly to it.
		mapObject.flyTo({
			bearing: options.bearing ?? currentBearing,
			center: { lat: coordinates[1], lng: coordinates[0] },
			duration: options.speed,
			zoom: thresholdZoomWithMargin,
		});
	}

	//
};
