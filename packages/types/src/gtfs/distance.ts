/* * */

/**
 * Converts pattern extension metres to GTFS kilometres (shapes.txt, stop_times.txt).
 * Rounds to 3 decimal places (1 m precision), matching stop_times export.
 */
export function metersToGtfsKm(meters: number): number {
	return Math.round((meters / 1000) * 1000) / 1000;
}

/**
 * Cumulative shape distance in metres at a shape point.
 * The last point (index pointCount - 1) equals extensionMeters.
 */
export function shapeDistTraveledMetersAtPoint(
	extensionMeters: number,
	pointIndex: number,
	pointCount: number,
): number {
	if (pointCount <= 1 || extensionMeters <= 0) return 0;
	if (pointIndex <= 0) return 0;
	if (pointIndex >= pointCount - 1) return extensionMeters;

	return (pointIndex / (pointCount - 1)) * extensionMeters;
}
