import { type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';

/* * */

/** Result type for planned trips metric */
export interface PlannedTripsMetricResult {
	agencyId: string
	date: string
	plannedTrips: number
}

/** Result type for completed trips metric */
export interface CompletedTripsMetricResult {
	agencyId: string
	completedTrips: number
	date: string
}

/** Result type for completed trips percentage */
export interface CompletedTripsPercentageResult {
	agencyId: string
	date: string
	percentage: number // completedTrips / plannedTrips * 100
}

/* * */

/**
 * Calculates the number of planned trips per agency and date
 */
export async function calculatePlannedTrips({ context, message }: TaskProps): Promise<PlannedTripsMetricResult[]> {
	message('Calculating planned trips...');

	const ridesCollection = await rides.getCollection();

	const startDateStr = Dates.fromOperationalDate(context.dates.start, 'Europe/Lisbon').unix_timestamp;
	const endDateStr = Dates.fromOperationalDate(context.dates.end, 'Europe/Lisbon').unix_timestamp;

	message(`Date range: ${startDateStr} to ${endDateStr}`);

	const pipeline = [
		{
			$match: {
				agency_id: { $exists: true },
				start_time_scheduled: { $gte: startDateStr, $lte: endDateStr },
			},
		},
		{
			$group: {
				_id: { agencyId: '$agency_id', date: '$operational_date' },
				plannedTrips: { $sum: 1 },
			},
		},
		{
			$project: {
				_id: 0,
				agencyId: '$_id.agencyId',
				date: '$_id.date',
				plannedTrips: 1,
			},
		},
	];

	const aggCursor = ridesCollection.aggregate(pipeline);

	const results: PlannedTripsMetricResult[] = [];

	for await (const doc of aggCursor) {
		const formattedDate = Dates.fromOperationalDate(doc.date, 'Europe/Lisbon').toFormat('dd/MM/yyyy');
		results.push({
			agencyId: doc.agencyId,
			date: formattedDate,
			plannedTrips: doc.plannedTrips,
		});
	}

	message(`Processed ${results.length} planned trips metrics`);
	return results;
}

/* * */

/**
 * Calculates the number of completed trips per agency and date
 */
export async function calculateCompletedTrips({ context, message }: TaskProps): Promise<CompletedTripsMetricResult[]> {
	message('Calculating completed trips...');

	const ridesCollection = await rides.getCollection();

	const startDateStr = Dates.fromOperationalDate(context.dates.start, 'Europe/Lisbon').toFormat('yyyyMMdd');
	const endDateStr = Dates.fromOperationalDate(context.dates.end, 'Europe/Lisbon').toFormat('yyyyMMdd');

	message(`Date range: ${startDateStr} to ${endDateStr}`);

	const pipeline = [
		{
			$match: {
				agency_id: { $exists: true },
				operational_date: { $gte: startDateStr, $lte: endDateStr },
			},
		},
		{
			$group: {
				_id: { agencyId: '$agency_id', date: '$operational_date' },
				completedTrips: {
					$sum: {
						$cond: [
							{
								$or: [
									{ $eq: ['$analysis.SIMPLE_ONE_APEX_VALIDATION.grade', 'pass'] },
									{ $eq: ['$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade', 'pass'] },
								],
							},
							1,
							0,
						],
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				agencyId: '$_id.agencyId',
				completedTrips: 1,
				date: '$_id.date',
			},
		},
	];

	const aggCursor = ridesCollection.aggregate(pipeline);

	const results: CompletedTripsMetricResult[] = [];

	for await (const doc of aggCursor) {
		const formattedDate = Dates.fromOperationalDate(doc.date, 'Europe/Lisbon').toFormat('dd/MM/yyyy');
		results.push({
			agencyId: doc.agencyId,
			completedTrips: doc.completedTrips,
			date: formattedDate,
		});
	}

	message(`Processed ${results.length} completed trips metrics`);
	return results;
}

/* * */

/**
 * Calculates the percentage of completed trips based on planned trips
 */
export function calculateCompletedTripsPercentage(
	plannedTrips: PlannedTripsMetricResult[],
	completedTrips: CompletedTripsMetricResult[],
): CompletedTripsPercentageResult[] {
	const percentageResults: CompletedTripsPercentageResult[] = [];

	// Create a lookup map for planned trips
	const plannedMap = new Map<string, number>();
	for (const p of plannedTrips) {
		plannedMap.set(`${p.date}-${p.agencyId}`, p.plannedTrips);
	}

	// Calculate % for each completed trip entry
	for (const c of completedTrips) {
		const key = `${c.date}-${c.agencyId}`;
		const planned = plannedMap.get(key) || 0;

		let percentage = 0;
		if (planned > 0) {
			percentage = (c.completedTrips / planned) * 100;
		}

		percentageResults.push({
			agencyId: c.agencyId,
			date: c.date,
			percentage: parseFloat(percentage.toFixed(1)), // round to 1 decimal
		});
	}

	return percentageResults;
}
