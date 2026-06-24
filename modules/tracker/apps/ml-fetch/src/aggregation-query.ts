/* * */

import { type AggregationPipeline } from '@tmlmobilidade/interfaces';
import { type Ride } from '@tmlmobilidade/types';

/* * */

interface AggregationQueryParams {
	endTimeScheduled: number
	headsign: string
	startTimeScheduled: number
}

interface RideMatchHeadsignWindowStagesParams {
	endTimeScheduled: number
	headsign: string
	startTimeScheduled: number
}

/**
 * Matches Metro Lisboa rides for a destination headsign within a scheduled start-time window.
 */
function rideMatchHeadsignWindowStages({ endTimeScheduled, headsign, startTimeScheduled }: RideMatchHeadsignWindowStagesParams): AggregationPipeline<Ride> {
	return [
		{
			$match: {
				agency_id: '2',
				headsign,
				start_time_scheduled: {
					$gte: startTimeScheduled,
					$lte: endTimeScheduled,
				},
			},
		},
	] as AggregationPipeline<Ride>;
}

/**
 * Joins the ride's `hashed_shapes` document by `hashed_shape_id`.
 */
function rideLookupHashedShapeStage(): AggregationPipeline<Ride> {
	return [
		{
			$lookup: {
				as: 'hashed_shape',
				foreignField: '_id',
				from: 'hashed_shapes',
				localField: 'hashed_shape_id',
			},
		},
	] as AggregationPipeline<Ride>;
}

/**
 * Resolves `stops` documents whose agency-scoped stop codes intersect the trip path.
 */
function hashedTripLookupStopDocsStage(): AggregationPipeline<Ride> {
	return [
		{
			$lookup: {
				as: 'stop_docs',
				from: 'stops',
				let: {
					agencyId: '$$agencyId',
					pathStopIds: '$path.stop_id',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$gt: [
									{
										$size: {
											$filter: {
												as: 'f',
												cond: {
													$and: [
														{ $in: ['$$f.stop_id', '$$pathStopIds'] },
														{ $in: ['$$agencyId', '$$f.agency_ids'] },
													],
												},
												input: '$flags',
											},
										},
									},
									0,
								],
							},
						},
					},
					{
						$project: {
							_id: 0,
							all_codes: {
								$map: {
									as: 'f',
									in: '$$f.stop_id',
									input: {
										$filter: {
											as: 'f',
											cond: {
												$in: ['$$agencyId', '$$f.agency_ids'],
											},
											input: '$flags',
										},
									},
								},
							},
						},
					},
				],
			},
		},
	] as AggregationPipeline<Ride>;
}

/**
 * Attaches `stop_codes` to each path waypoint by matching the waypoint's `stop_id`
 * against agency-scoped codes on the corresponding stop document (no cross-stop flattening).
 */
function hashedTripEnrichPathWithStopCodesStage(): AggregationPipeline<Ride> {
	return [
		{
			$addFields: {
				path: {
					$map: {
						as: 'p',
						in: {
							$let: {
								in: {
									$mergeObjects: [
										'$$p',
										{
											stop_codes: {
												$ifNull: ['$$matchedStop.all_codes', []],
											},
										},
									],
								},
								vars: {
									matchedStop: {
										$first: {
											$filter: {
												as: 'sd',
												cond: {
													$gt: [
														{
															$size: {
																$filter: {
																	as: 'c',
																	cond: {
																		$eq: ['$$c', '$$p.stop_id'],
																	},
																	input: '$$sd.all_codes',
																},
															},
														},
														0,
													],
												},
												input: '$stop_docs',
											},
										},
									},
								},
							},
						},
						input: '$path',
					},
				},
			},
		},
	] as AggregationPipeline<Ride>;
}

/**
 * Loads the ride's `hashed_trips` document and enriches each path waypoint with `stop_codes`.
 */
function rideLookupHashedTripWithStopCodesStages(): AggregationPipeline<Ride> {
	return [
		{
			$lookup: {
				as: 'hashed_trip',
				from: 'hashed_trips',
				let: {
					agencyId: '$agency_id',
					tripId: '$hashed_trip_id',
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$_id', '$$tripId'],
							},
						},
					},
					...hashedTripLookupStopDocsStage(),
					...hashedTripEnrichPathWithStopCodesStage(),
					{
						$project: {
							stop_docs: 0,
						},
					},
				],
			},
		},
	] as AggregationPipeline<Ride>;
}

/**
 * Flattens the joined hashed shape and trip arrays produced by `$lookup`.
 */
function rideUnwindHashedRefsStages(): AggregationPipeline<Ride> {
	return [
		{ $unwind: '$hashed_trip' },
		{ $unwind: '$hashed_shape' },
	] as AggregationPipeline<Ride>;
}

/**
 * Keeps only the joined hashed shape and trip on the ride document.
 */
function rideProjectHashedRefsStage(): AggregationPipeline<Ride> {
	return [
		{
			$project: {
				hashed_shape: 1,
				hashed_trip: 1,
			},
		},
	] as AggregationPipeline<Ride>;
}

/**
 * Finds a single Metro Lisboa ride whose headsign and scheduled start time match an
 * upcoming train, then joins its hashed shape and trip.
 *
 * The hashed trip path is enriched with agency-scoped `stop_codes` per waypoint so
 * downstream logic can match ML API stop identifiers to GTFS path positions.
 *
 * Pipeline stages:
 * 1. Filter rides by agency, headsign, and scheduled start-time window.
 * 2. `$lookup` hashed shape and hashed trip.
 * 3. Resolve stop codes per path waypoint from `stops.flags`.
 * 4. Unwind lookups and project `hashed_shape` + `hashed_trip`.
 *
 * @param headsign - Destination stop name used as the ride headsign.
 * @param startTimeScheduled - Lower bound (inclusive) for `start_time_scheduled`.
 * @param endTimeScheduled - Upper bound (inclusive) for `start_time_scheduled`.
 * @returns Aggregation pipeline for the `rides` collection.
 */
export function aggregationQuery({ endTimeScheduled, headsign, startTimeScheduled }: AggregationQueryParams): AggregationPipeline<Ride> {
	return [
		...rideMatchHeadsignWindowStages({ endTimeScheduled, headsign, startTimeScheduled }),
		...rideLookupHashedShapeStage(),
		...rideLookupHashedTripWithStopCodesStages(),
		...rideUnwindHashedRefsStages(),
		...rideProjectHashedRefsStage(),
	] as AggregationPipeline<Ride>;
}
