/* * */

import { GeoJsonPositionSchema } from '@/geojson/base/position.js';
import { z } from 'zod';

/**
 * A linear ring is a closed polygon with at least 4 points.
 * The first and last points must be the same, as to form a closed surface.
 */
export const GeoJsonLinearRingSchema = z.array(GeoJsonPositionSchema)
	.min(4)
	.refine((points) => {
		// A linear ring must have at least 4 points.
		if (points.length < 4) return false;
		// The first and last points must be the same in both dimensions.
		const firstPoint = points[0];
		const lastPoint = points[points.length - 1];
		return firstPoint.every((value, index) => value === lastPoint[index]);
	});

export type GeoJsonLinearRing = z.infer<typeof GeoJsonLinearRingSchema>;
