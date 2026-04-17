/* * */

import * as turf from '@turf/turf';
import { MapRef } from '@vis.gl/react-maplibre';
import { type Feature, type GeoJsonProperties, type Geometry } from 'geojson';

/**
 * Centers the map view on the given features.
 * @param mapObject The map that should be manipulated
 * @param features The features to center the map on
 */
export function centerMapView(mapObject: MapRef, features: Feature<Geometry, GeoJsonProperties>[]) {
	//

	//
	// Validate input parameters

	if (!mapObject) return;
	if (!features.length) return;

	//
	// Filter out invalid features (those without geometry or coordinates)

	const validFeatures = features.filter(
		feature => feature?.geometry && ('coordinates' in feature.geometry) && feature.geometry.coordinates,
	);

	if (!validFeatures.length) return;

	//
	// Create a feature collection from the given features, and get the corresponding envelope.
	// Return if the envelope is not valid.

	const featureCollection = turf.featureCollection(validFeatures);
	const featureCollectionEnvelope = turf.envelope(featureCollection);
	if (!featureCollectionEnvelope?.bbox) return;

	//
	// Validate if the envelope is valid

	if (featureCollectionEnvelope.bbox.length < 4) return;
	if (featureCollectionEnvelope.bbox[0] < -90 || featureCollectionEnvelope.bbox[0] > 90) return;
	if (featureCollectionEnvelope.bbox[1] < -180 || featureCollectionEnvelope.bbox[1] > 180) return;
	if (featureCollectionEnvelope.bbox[2] < -90 || featureCollectionEnvelope.bbox[2] > 90) return;
	if (featureCollectionEnvelope.bbox[3] < -180 || featureCollectionEnvelope.bbox[3] > 180) return;

	//
	// Center the map on the envelope

	mapObject.fitBounds(
		[
			featureCollectionEnvelope.bbox[0],
			featureCollectionEnvelope.bbox[1],
			featureCollectionEnvelope.bbox[2],
			featureCollectionEnvelope.bbox[3],
		],
		{
			animate: true,
			bearing: 0,
			padding: 25,
			pitch: 0,
		},
	);

	//
};
