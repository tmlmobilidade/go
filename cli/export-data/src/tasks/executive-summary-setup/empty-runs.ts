import { type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';

/* * */

/** Result type for observed trips metric */
export interface ObservedTripsMetricResult {
	agencyId: string
	date: string
	tripswpassengers: number
	tripszeropassengers: number
	tripszeropassengersPct: number // NEW: percentage of zero-passenger trips
}

/* * */

/**
 * Calculates observed trips metrics including % of trips with zero passengers
 */
export async function calculateObservedTrips({ context, message }: TaskProps): Promise<ObservedTripsMetricResult[]> {
	message('Calculating observed trips metrics...');

	// Get the rides collection from MongoDB
	const ridesCollection = await rides.getCollection();

	message(`Date range: ${context.dates.start} to ${context.dates.end}`);

	// Trips with passengers_observed = 0
	const pipelineZero = [
		{
			$match: {
				$expr: {
					$or: [
						{ $eq: ['$analysis.SIMPLE_ONE_APEX_VALIDATION.grade', 'pass'] },
						{ $eq: ['$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade', 'pass'] },
					],
				},
				agency_id: { $exists: true },
				operational_date: { $gte: context.dates.start, $lte: context.dates.end },
				passengers_observed: 0,
			},
		},
		{
			$group: {
				_id: { agencyId: '$agency_id', date: '$operational_date' },
				tripszeropassengers: { $sum: 1 },
			},
		},
		{
			$project: {
				_id: 0,
				agencyId: '$_id.agencyId',
				date: '$_id.date',
				tripszeropassengers: 1,
			},
		},
	];

	const zeroCursor = ridesCollection.aggregate<{ agencyId: string, date: string, tripszeropassengers: number }>(pipelineZero);
	const zeroResults = new Map<string, { agencyId: string, date: string, tripszeropassengers: number }>();

	for await (const doc of zeroCursor) {
		const key = `${doc.date}-${doc.agencyId}`;
		zeroResults.set(key, doc);
	}

	// Trips with passengers_observed != 0
	const pipelineNonZero = [
		{
			$match: {
				agency_id: { $exists: true },
				operational_date: { $gte: context.dates.start, $lte: context.dates.end },
				passengers_observed: { $ne: 0 },
			},
		},
		{
			$group: {
				_id: { agencyId: '$agency_id', date: '$operational_date' },
				tripswpassengers: { $sum: 1 },
			},
		},
		{
			$project: {
				_id: 0,
				agencyId: '$_id.agencyId',
				date: '$_id.date',
				tripswpassengers: 1,
			},
		},
	];

	const nonZeroCursor = ridesCollection.aggregate<{ agencyId: string, date: string, tripswpassengers: number }>(pipelineNonZero);
	const nonZeroResults = new Map<string, { agencyId: string, date: string, tripswpassengers: number }>();

	for await (const doc of nonZeroCursor) {
		const key = `${doc.date}-${doc.agencyId}`;
		nonZeroResults.set(key, doc);
	}

	// Merge results and calculate tripszeropassengers%
	const mergedResults: ObservedTripsMetricResult[] = [];
	const allKeys = new Set([...nonZeroResults.keys(), ...zeroResults.keys()]);

	for (const key of allKeys) {
		const zero = zeroResults.get(key);
		const nonZero = nonZeroResults.get(key);

		const dateStr = zero?.date ?? nonZero?.date ?? '';
		const agencyId = zero?.agencyId ?? nonZero?.agencyId ?? '';

		const formattedDate = Dates.fromOperationalDate(dateStr, 'Europe/Lisbon').toFormat('dd/MM/yyyy');

		const tripszeropassengers = zero?.tripszeropassengers ?? 0;
		const tripswpassengers = nonZero?.tripswpassengers ?? 0;

		// Calculate % of trips with zero passengers
		const tripszeropassengersPct = tripswpassengers > 0
			? parseFloat(((tripszeropassengers / tripswpassengers) * 100).toFixed(1))
			: 0;

		mergedResults.push({
			agencyId,
			date: formattedDate,
			tripswpassengers,
			tripszeropassengers,
			tripszeropassengersPct, // include the percentage
		});
	}

	message(`Processed ${mergedResults.length} observed trips metrics`);

	return mergedResults;
}
