/* * */

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/* * */

export interface HashedShapePoint {
	shape_dist_traveled: number
	shape_pt_lat: number
	shape_pt_lon: number
	shape_pt_sequence: number
}

/* * */

export interface HashedShape {
	_id: string
	agency_id: string
	created_at: UnixTimestamp
	points: HashedShapePoint[]
	updated_at: UnixTimestamp
}
