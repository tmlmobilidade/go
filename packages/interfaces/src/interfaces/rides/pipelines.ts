import { AggregationPipeline } from '@/common/aggregation-pipeline.js';
import { Dates } from '@tmlmobilidade/dates';
import { DelayStatus, OperationalStatus, Ride, RideAcceptanceStatus, RideAnalysisGradeWithNone, SeenStatus, UnixTimestamp } from '@tmlmobilidade/types';

//
// Time thresholds

const LAST_SEEN_WINDOW = 30 * 1000; // 30 seconds
const OPERATIONAL_WINDOW = 60 * 1000 * 10; // 10 minutes
const DELAY_THRESHOLDS = {
	delayed: 5 * 60 * 1000, // 5 minutes after scheduled time
	early: -1 * 60 * 1000, // 1 minute before scheduled time
};

/**
 * Creates MongoDB aggregation pipeline stages to calculate and categorize delay statuses.
 *
 * This function generates three aggregation stages:
 * 1. Calculates delay differences (in milliseconds) between scheduled and observed times
 * 2. Categorizes delays into statuses: 'delayed', 'early', 'ontime', or 'none'
 * 3. Removes intermediate calculation fields
 *
 * Delay thresholds:
 * - Delayed: > 5 minutes (300000 ms)
 * - Early: < -1 minute (-60000 ms)
 * - On-time: between -1 minute and 5 minutes
 * - None: missing scheduled or observed time data
 *
 * @returns {Array} Array of MongoDB aggregation pipeline stages
 */
export function ridesPipelineDelayStatus({ filter }: { filter?: { end_delay_status?: DelayStatus[], start_delay_status?: DelayStatus[] } } = {}): AggregationPipeline<Ride> {
	const pipeline: AggregationPipeline<Ride> = [
		// Stage 1: Calculate delay differences in milliseconds
		// Only compute if both scheduled and observed times exist
		{
			$addFields: {
				end_delay_diff: {
					$cond: {
						else: null,
						if: { $and: [
							{ $ifNull: ['$end_time_scheduled', false] },
							{ $ifNull: ['$end_time_observed', false] },
						] },
						then: { $subtract: ['$end_time_observed', '$end_time_scheduled'] },
					},
				},
				start_delay_diff: {
					$cond: {
						else: null,
						if: { $and: [
							{ $ifNull: ['$start_time_scheduled', false] },
							{ $ifNull: ['$start_time_observed', false] },
						] },
						then: { $subtract: ['$start_time_observed', '$start_time_scheduled'] },
					},
				},
			},
		},
		// Stage 2: Categorize delays into status strings
		// Uses switch statement to classify based on delay thresholds
		{
			$addFields: {
				end_delay_status: {
					$switch: {
						branches: [
							// Delayed: > 5 minutes (300000 ms)
							{ case: { $gt: ['$end_delay_diff', DELAY_THRESHOLDS.delayed] }, then: 'delayed' },
							// Early: < -1 minute (-60000 ms)
							{ case: { $lt: ['$end_delay_diff', DELAY_THRESHOLDS.early] }, then: 'early' },
							// On-time: between -1 minute and 5 minutes
							{ case: { $and: [
								{ $gte: ['$end_delay_diff', DELAY_THRESHOLDS.early] },
								{ $lte: ['$end_delay_diff', DELAY_THRESHOLDS.delayed] },
							] }, then: 'ontime' },
						],
						default: 'none',
					},
				},
				start_delay_status: {
					$switch: {
						branches: [
							// Delayed: > 5 minutes (300000 ms)
							{ case: { $gt: ['$start_delay_diff', DELAY_THRESHOLDS.delayed] }, then: 'delayed' },
							// Early: < -1 minute (-60000 ms)
							{ case: { $lt: ['$start_delay_diff', DELAY_THRESHOLDS.early] }, then: 'early' },
							// On-time: between -1 minute and 5 minutes
							{ case: { $and: [
								{ $gte: ['$start_delay_diff', DELAY_THRESHOLDS.early] },
								{ $lte: ['$start_delay_diff', DELAY_THRESHOLDS.delayed] },
							] }, then: 'ontime' },
						],
						default: 'none',
					},
				},
			},
		},
		// Stage 3: Remove intermediate calculation fields
		// These fields were only used for status calculation and are not needed in final output
		{ $project: { end_delay_diff: 0, start_delay_diff: 0 } },
	];

	// Stage 5: Filter by delay status if provided
	if (filter?.end_delay_status) {
		pipeline.push({ $match: { end_delay_status: { $in: filter.end_delay_status } } });
	}

	if (filter?.start_delay_status) {
		pipeline.push({ $match: { start_delay_status: { $in: filter.start_delay_status } } });
	}

	return pipeline;
}

/**
 * Creates MongoDB aggregation pipeline stages to calculate and categorize operational statuses.
 *
 * This function generates four aggregation stages:
 * 1. Adds the current timestamp (now) to each document
 * 2. Calculates time differences from last seen and from start time
 * 3. Categorizes operational status: 'scheduled', 'missed', 'running', or 'ended'
 * 4. Removes intermediate calculation fields
 *
 * Operational status logic:
 * - Scheduled: within 10 minutes of start time and never seen
 * - Missed: more than 10 minutes after start time and never seen
 * - Running: last seen within 10 minutes
 * - Ended: default fallback (last seen more than 10 minutes ago)
 *
 * Time thresholds:
 * - Operational window: 10 minutes (600000 ms)
 *
 * @param {number} now - Current timestamp in milliseconds
 * @returns {Array} Array of MongoDB aggregation pipeline stages
 */
export function ridesPipelineOperationalStatus({ filter }: { filter?: { operational_status?: OperationalStatus[] } } = {}): AggregationPipeline<Ride> {
	const now = Dates.now('Europe/Lisbon').unix_timestamp;

	const pipeline: AggregationPipeline<Ride> = [
		// Stage 1: Add current timestamp to each document
		{ $addFields: { now } },
		// Stage 2: Calculate time differences from last seen and from start time
		// Only compute if the relevant fields exist
		{
			$addFields: {
				milliseconds_from_last_seen_to_now: {
					$cond: {
						else: null,
						if: { $ifNull: ['$seen_last_at', false] },
						then: { $subtract: ['$now', '$seen_last_at'] },
					},
				},
				milliseconds_from_start_to_now: { $subtract: ['$now', '$start_time_scheduled'] },
			},
		},
		// Stage 3: Categorize operational status using switch statement
		{
			$addFields: {
				operational_status: {
					$switch: {
						branches: [
							// Scheduled: within 10 minutes of start time and never seen
							{
								case: {
									$and: [
										{ $lte: ['$milliseconds_from_start_to_now', OPERATIONAL_WINDOW] },
										{ $or: [{ $eq: ['$seen_last_at', null] }, { $not: ['$seen_last_at'] }] },
									],
								},
								then: 'scheduled',
							},
							// Missed: more than 10 minutes after start time and never seen
							{
								case: {
									$and: [
										{ $gt: ['$milliseconds_from_start_to_now', OPERATIONAL_WINDOW] },
										{ $or: [{ $eq: ['$seen_last_at', null] }, { $not: ['$seen_last_at'] }] },
									],
								},
								then: 'missed',
							},
							// Running: last seen within 10 minutes
							{
								case: { $lte: ['$milliseconds_from_last_seen_to_now', OPERATIONAL_WINDOW] },
								then: 'running',
							},
						],
						default: 'ended',
					},
				},
			},
		},
		// Stage 4: Remove intermediate calculation fields
		// These fields were only used for status calculation and are not needed in final output
		{
			$project: {
				milliseconds_from_last_seen_to_now: 0,
				milliseconds_from_start_to_now: 0,
				now: 0,
			},
		},
	];

	// Stage 5: Filter by operational status if provided
	if (filter?.operational_status) {
		pipeline.push({ $match: { operational_status: { $in: filter.operational_status } } });
	}

	return pipeline;
}

/**
 * Creates MongoDB aggregation pipeline stages to calculate and categorize seen statuses.
 *
 * This function generates three aggregation stages:
 * 1. Adds the current timestamp (now) to each document
 * 2. Calculates time difference from last seen to now
 * 3. Categorizes seen status: 'gone', 'seen', or 'unseen'
 * 4. Removes intermediate calculation fields
 *
 * Seen status logic:
 * - Gone: last seen more than 30 seconds ago
 * - Seen: last seen within 30 seconds
 * - Unseen: no last seen time
 *
 * Time thresholds:
 * - Seen window: 30 seconds (30000 ms)
 *
 * @param {number} now - Current timestamp in milliseconds
 * @returns {Array} Array of MongoDB aggregation pipeline stages
 */
export function ridesPipelineSeenStatus({ filter }: { filter?: { seen_status?: SeenStatus[] } } = {}): AggregationPipeline<Ride> {
	const now = Dates.now('Europe/Lisbon').unix_timestamp;

	const pipeline: AggregationPipeline<Ride> = [
		// Stage 1: Add current timestamp to each document
		{ $addFields: { now } },
		// Stage 2: Calculate time difference from last seen to now
		// Only compute if the last seen time exists
		{
			$addFields: {
				milliseconds_from_last_seen_to_now: {
					$cond: {
						else: null,
						if: { $ifNull: ['$seen_last_at', false] },
						then: { $subtract: ['$now', '$seen_last_at'] },
					},
				},
			},
		},
		// Stage 3: Categorize seen status using switch statement
		{
			$addFields: {
				seen_status: {
					$switch: {
						branches: [
							{ case: { $eq: ['$seen_last_at', null] }, then: 'unseen' },
							{ case: { $lte: ['$milliseconds_from_last_seen_to_now', LAST_SEEN_WINDOW] }, then: 'seen' },
						],
						default: 'gone',
					},
				},
			},
		},
		// Stage 4: Remove intermediate calculation fields
		// These fields were only used for status calculation and are not needed in final output
		{
			$project: {
				milliseconds_from_last_seen_to_now: 0,
				now: 0,
			},
		},
	];

	// Stage 5: Filter by seen status if provided
	if (filter?.seen_status) {
		pipeline.push({ $match: { seen_status: { $in: filter.seen_status } } });
	}

	return pipeline;
}

interface RidesPipelineFilter {
	acceptance_status?: ('none' | RideAcceptanceStatus)[]
	agency_ids?: string[]
	analysis_ended_at_last_stop_grade?: RideAnalysisGradeWithNone[]
	analysis_expected_apex_validation_interval?: RideAnalysisGradeWithNone[]
	analysis_simple_three_vehicle_events_grade?: RideAnalysisGradeWithNone[]
	analysis_transaction_sequentiality?: RideAnalysisGradeWithNone[]
	date_end: UnixTimestamp
	date_start: UnixTimestamp
	delay_statuses?: DelayStatus[]
	line_ids?: string[]
	operational_statuses?: OperationalStatus[]
	search?: string
	seen_statuses?: SeenStatus[]
	stop_ids?: string[]
}

/**
 * Creates MongoDB aggregation pipeline stages to filter and process ride data.
 *
 * This function generates an aggregation pipeline with the following stages:
 * 1. Filters rides by scheduled time range (date_start to date_end)
 * 2. Optionally filters by line IDs
 * 3. Optionally filters by agency IDs
 * 4. Optionally searches rides by ride ID using regex pattern matching and, if present, by vehicle IDs in the search string (with support for "v:1117,1118" etc.)
 * 5. Adds acceptance status by joining from the ride_acceptances collection
 * 6. Filters by analysis grades (ended_at_last_stop, expected_apex_validation_interval, simple_three_vehicle_events)
 * 7. Filters by acceptance status (excluding 'none' if present)
 * 8. Applies delay, operational, and seen status filters using dedicated pipeline functions
 *
 * @param {Object} params - Parameters object
 * @param {RidesPipelineFilter} params.filter - Filter criteria for rides
 * @returns {AggregationPipeline<Ride>} Array of MongoDB aggregation pipeline stages
 */
export function ridesBatchAggregationPipeline({ ...filter }: RidesPipelineFilter): AggregationPipeline<Ride> {
	const pipeline: AggregationPipeline<Ride> = [];

	// Stage 1: Filter by scheduled time range (required)
	pipeline.push({ $match: { start_time_scheduled: { $gte: filter.date_start, $lte: filter.date_end } } });

	// Stage 2: Filter by agency IDs (required)
	pipeline.push({ $match: { agency_id: { $in: filter.agency_ids ?? [] } } });

	// Stage 3: Filter by line IDs if provided
	if (filter.line_ids?.length) pipeline.push({ $match: { line_id: { $in: filter.line_ids.map(id => Number(id)) } } });

	// Stage 4: Search by ride ID if provided
	// Uses regex pattern matching with case-insensitive option
	// Also removes all vehicle IDs and driver IDs from the search string
	// And adds a filter for the vehicle IDs if they are present in the search string (v:1117,1118)
	// And adds a filter for the driver IDs if they are present in the search string (d:123,456)
	if (filter.search) {
		// Extract vehicle and driver IDs before stripping them from search
		const vehicleMatch = filter.search.match(/v:([\d,]+)/);
		const driverMatch = filter.search.match(/d:([\d,]+)/);

		// Remove v: and d: patterns from search string for ride ID matching
		const searchWithoutSpecialFilters = filter.search.replace(/v:[\d,]+/g, '').replace(/d:[\d,]+/g, '').trim();

		const keywords = searchWithoutSpecialFilters
			.split(/\s+/)
			.filter(k => k.length > 0)
			.map((v) => {
				// Escape regex special chars EXCEPT %
				let escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

				// Convert SQL wildcards to regex
				escaped = escaped.replace(/%%/g, '.*');

				return escaped;
			});

		if (keywords.length > 0) {
			const pattern = keywords.map(k => `(?=.*${k})`).join('') + '.*';
			pipeline.push({
				$match: { _id: { $options: 'i', $regex: pattern } },
			});
		}

		if (vehicleMatch) {
			const value = vehicleMatch[1];

			const vehicleIDs = value
				.split(',')
				.map(id => Number(id.trim()))
				.filter(id => !isNaN(id));

			if (vehicleIDs.length > 0) {
				pipeline.push({ $match: { vehicle_ids: { $in: vehicleIDs } } });
			}
		}

		if (driverMatch) {
			const value = driverMatch[1];
			const driverIDs = value.split(',').map(id => id.trim()).filter(id => id);

			if (driverIDs.length > 0) {
				pipeline.push({ $match: { driver_ids: { $in: driverIDs } } });
			}
		}
	}

	// Stage 5: Search by vehicle IDs from search field if provided (legacy support)
	// This allows filtering via search field with "v:1117" or "v:1117,1118" format
	// Remove literal 'v:' from the search string since it is breaking stuff

	// Stage 6: Add acceptance status from ride_acceptances collection
	// Lookup joins acceptance data, unwinds to flatten, adds status field, and removes intermediate data
	pipeline.push(
		{ $lookup: { as: 'acceptance', foreignField: 'ride_id', from: 'ride_acceptances', localField: '_id' } },
		{ $unwind: { path: '$acceptance', preserveNullAndEmptyArrays: true } },
		{ $addFields: { acceptance_status: '$acceptance.acceptance_status' } },
		{ $project: { acceptance: 0 } },
	);

	// Stage 7: Filter by analysis grades
	// Maps filter fields to their corresponding analysis paths in the document
	const analysisFilters: { field: string, path: string }[] = [
		{ field: 'analysis_ended_at_last_stop_grade', path: 'analysis.ENDED_AT_LAST_STOP.grade' },
		{ field: 'analysis_expected_apex_validation_interval', path: 'analysis.EXPECTED_APEX_VALIDATION_INTERVAL.grade' },
		{ field: 'analysis_simple_three_vehicle_events_grade', path: 'analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade' },
		{ field: 'analysis_transaction_sequentiality', path: 'analysis.TRANSACTION_SEQUENTIALITY.grade' },
	];

	analysisFilters.forEach(({ field, path }) => {
		if (!filter[field]) return;

		if (filter[field].includes('none')) {
			// When 'none' is included, set the field to 'none'
			// if it doesn't exist, then match on the filter array
			pipeline.push({
				$addFields: {
					[path]: { $ifNull: [`$${path}`, 'none'] },
				},
			});
		}

		// Match documents where the field value is in the filter array
		pipeline.push({
			$match: {
				[path]: { $in: filter[field] },
			},
		});
	});

	// Stage 8: Filter by acceptance status
	// Only applies filter if acceptance_status is provided and doesn't include 'none'
	if (filter.acceptance_status && filter.acceptance_status) {
		if (filter.acceptance_status.includes('none')) {
			// When 'none' is included, set the field to 'none'
			// if it doesn't exist, then match on the filter array
			pipeline.push({
				$addFields: {
					acceptance_status: { $ifNull: [`$acceptance_status`, 'none'] },
				},
			});
		}
		pipeline.push(
			{ $match: { acceptance_status: { $exists: true } } },
			{ $match: { acceptance_status: { $in: filter.acceptance_status } } },
		);
	}

	// Stage 9: Apply status filters using dedicated pipeline functions
	// These functions add calculated status fields and filter by them
	pipeline.push(...ridesPipelineDelayStatus({ filter: { end_delay_status: filter.delay_statuses, start_delay_status: filter.delay_statuses } }));
	pipeline.push(...ridesPipelineOperationalStatus({ filter: { operational_status: filter.operational_statuses } }));
	pipeline.push(...ridesPipelineSeenStatus({ filter: { seen_status: filter.seen_statuses } }));

	return pipeline;
}
