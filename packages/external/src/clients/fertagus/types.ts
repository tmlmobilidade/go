/* * */

/**
 * @see GET /trains
 */
export type TrainsResponse = Array<{
	date: string
	latitude: null | number
	longitude: null | number
	startsAt: null | string
	stop_id_end: null | string
	stop_id_start: null | string
	train_id: null | string
}>;
