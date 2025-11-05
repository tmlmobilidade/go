/* * */

import { EARTH_RADIUS } from '@/constants.js';
import { toFeatureFromObject, toPointFromPositions } from '@/conversions.js';
import { polygon } from '@turf/turf';
import { type Feature, type Point, type Polygon } from 'geojson';

/**
 * Create a geofence around a given point with a given radius in meters (default is 50 meters).
 * @param point A GeoJSON Point representation of the point to create the geofence around.
 * @param radius The distance in meters to calculate the geofence radius. Default is 50 meters.
 * @param steps The number of steps to use for the buffer. Default is 16.
 * @returns The GeoJSON Feature of a Polygon.
 */
export function getGeofenceOnPoint(point: Feature<Point>, radius = 50, steps = 16): Feature<Polygon> {
	// Extract the center coordinates from the point
	const [centerLon, centerLat] = point.geometry.coordinates;
	// Set the angle size based on the number of steps
	const angleStep = (2 * Math.PI) / steps;
	// Set an empty array to hold the coordinates of the polygon vertices
	const coords: [number, number][] = [];
	// Calculate the coordinates of the polygon vertices
	for (let i = 0; i < steps; i++) {
		const angle = i * angleStep;
		const dx = radius * Math.cos(angle);
		const dy = radius * Math.sin(angle);
		const newLat = centerLat + (dy / EARTH_RADIUS) * (180 / Math.PI);
		const newLng = centerLon + (dx / (EARTH_RADIUS * Math.cos((centerLat * Math.PI) / 180))) * (180 / Math.PI);
		coords.push([newLng, newLat]);
	}
	// Close the polygon by adding the first coordinate to the end
	coords.push(coords[0]);
	// Return the polygon feature
	return polygon([coords]);
}

/**
 * Create a geofence around a given position with a given radius in meters (default is 50 meters).
 * @param position A tuple representing the coordinates of the point to create the geofence around.
 * @param radius The distance in meters to calculate the geofence radius. Default is 50 meters.
 * @param steps The number of steps to use for the buffer. Default is 16.
 * @returns The GeoJSON Feature of a Polygon.
 */
export function getGeofenceOnPosition(position: [number, number], radius = 50, steps = 16): Feature<Polygon> {
	// Create a point feature from the coordinates
	const newPoint = toPointFromPositions(position);
	const newFeature = toFeatureFromObject(newPoint);
	// Call the getGeofenceOnPoint function to create the geofence
	return getGeofenceOnPoint(newFeature, radius, steps);
}
