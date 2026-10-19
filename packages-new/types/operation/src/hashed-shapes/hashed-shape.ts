/* * */

import { EncodedPolylineSchema } from '@tmlmobilidade/go-types-geo';
import { NonNegativeIntegerSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HashedShapeSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	extension: NonNegativeIntegerSchema,
	shape_id: z.string(),
	shape_polyline: EncodedPolylineSchema,
	updated_at: UnixMillisecondsSchema,
});

/**
 * A HashedShape represents the unique sequence of points that make up the path of a set of trips.
 */
export type HashedShape = z.infer<typeof HashedShapeSchema>;

/* * */

export const CreateHashedShapeSchema = HashedShapeSchema.omit({
	_id: true,
	updated_at: true,
});

/**
 * A specific type for creating a HashedShape, without the _id and updated_at fields.
 */
export type CreateHashedShape = z.infer<typeof CreateHashedShapeSchema>;
