/* * */

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/**
 * @deprecated Use the `HashedTrip` type from the `@tmlmobilidade/go-types-operation` package instead.
 */
export interface HashedShapePoint {
	shape_dist_traveled: number
	shape_pt_lat: number
	shape_pt_lon: number
	shape_pt_sequence: number
}

/**
 * @deprecated Use the `HashedTrip` type from the `@tmlmobilidade/go-types-operation` package instead.
 */
export interface HashedShape {
	_id: string
	agency_id: string
	created_at: UnixTimestamp
	points: HashedShapePoint[]
	updated_at: UnixTimestamp
}
