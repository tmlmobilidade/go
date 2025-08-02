/* eslint-disable @typescript-eslint/no-explicit-any */

/* * */

import { mapDefaultValues } from '@/settings/map.settings';
import { featureCollection, point } from '@turf/turf';
import * as turf from '@turf/turf';

/* * */

interface CenterMapOptions {
	padding: number
}

/**
 *
 * @param mapObject The map that should be manipulated
 * @param features The features to center the map on
 * @param options Optional settings to customize the centering
 */
export const centerMap = (mapObject: any, features: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>[], options?: CenterMapOptions) => {
	//

	//
	// Validate input parameters

	if (!mapObject) return;
	if (!features.length) return;

	//
	// Create a feature collection from the given features, and get the corresponding envelope.
	// Return if the envelope is not valid.

	const tFeatureCollection = featureCollection(features);
	const featureCollectionEnvelope = turf.envelope(tFeatureCollection);
	if (!featureCollectionEnvelope || !featureCollectionEnvelope.bbox) return;

	//
	// Validate if the envelope is valid

	if (featureCollectionEnvelope.bbox.length < 4) return;
	if (featureCollectionEnvelope.bbox[0] < 90 || featureCollectionEnvelope.bbox[0] > 90) return;
	if (featureCollectionEnvelope.bbox[1] < 180 || featureCollectionEnvelope.bbox[1] > 180) return;
	if (featureCollectionEnvelope.bbox[2] < 90 || featureCollectionEnvelope.bbox[2] > 90) return;
	if (featureCollectionEnvelope.bbox[3] < 180 || featureCollectionEnvelope.bbox[3] > 180) return;

	//
	// Center the map on the envelope

	mapObject.fitBounds(
		[
			featureCollectionEnvelope.bbox[0],
			featureCollectionEnvelope.bbox[1],
			featureCollectionEnvelope.bbox[2],
			featureCollectionEnvelope.bbox[3],
		],
		{ padding: options?.padding || 25 },
	);

	//
};

/* * */

/**
 *
 * @param mapObject THe map that should be manipulated
 * @param coordinates The destination coordinates to move the map to
 * @param options Optional settings to customize the movement
 */
export const moveMap = (mapObject: any, coordinates: GeoJSON.Position) => {
	//

	//
	// Validate the input parameters

	if (!mapObject) return;
	if (!coordinates || !coordinates.length) return;

	//
	// Get map current zoom level

	const currentZoom = mapObject.getZoom();
	const currentZoomWithMargin = currentZoom + mapDefaultValues.zoom_margin;
	const thresholdZoomWithMargin = mapDefaultValues.zoom + mapDefaultValues.zoom_margin;

	//
	// Check if the given coordinates are inside the currently rendered map bounds

	const currentMapBounds: [[number, number], [number, number]] = mapObject.getBounds().toArray();
	const isInside = turf.booleanIntersects(point(coordinates), turf.bboxPolygon([...currentMapBounds[0], ...currentMapBounds[1]]));

	//
	// If the given coordinates are visible and the zoom is not too far back (plus a little margin)...

	if (isInside && currentZoomWithMargin > (thresholdZoomWithMargin * 1.15)) {
		// ...then simply ease to it.
		mapObject.easeTo({ center: coordinates, duration: mapDefaultValues.speed * 0.25, zoom: currentZoom });
	}
	else {
		// If the zoom is too far, or the given coordinates are not visible, then fly to it
		mapObject.flyTo({ center: coordinates, duration: mapDefaultValues.speed, zoom: thresholdZoomWithMargin });
	}

	//
};

/* * */

/**
 * Return a base GeoJSON Feature for LineString object
 * @returns A GeoJSON Feature for LineString object with an empty features array
 */

export const getBaseGeoJsonFeatureLineString = (): GeoJSON.Feature<GeoJSON.LineString> => {
	return Object.assign({ geometry: { coordinates: [], type: 'LineString' }, properties: {}, type: 'Feature' });
};

/**
 * Return a base GeoJSON FeatureCollection object
 * @returns A GeoJSON FeatureCollection object with an empty features array
 */

export const getBaseGeoJsonFeatureCollection = (): GeoJSON.FeatureCollection<GeoJSON.LineString | GeoJSON.Point, GeoJSON.GeoJsonProperties> => {
	return Object.assign({ features: [], type: 'FeatureCollection' });
};
