/* * */

import { type UnixTimestamp } from '@/_common/unix-timestamp.js';

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
