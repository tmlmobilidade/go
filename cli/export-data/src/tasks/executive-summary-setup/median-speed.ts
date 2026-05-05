import { type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';

/** Result type for median speed by agency */
export interface AgencyMedianSpeedResult {
	agencyId: string
	medianSpeed: number // km/h
}

/**
 * Helper to calculate median from an array of numbers
 */
function median(values: number[]): number {
	if (values.length === 0) return 0;
	values.sort((a, b) => a - b);
	const mid = Math.floor(values.length / 2);
	if (values.length % 2 === 0) {
		return (values[mid - 1] + values[mid]) / 2;
	} else {
		return values[mid];
	}
}

/**
 * Calculates median speed per agency (all dates combined)
 * Considers only rides with positive duration and distance
 */
export async function calculateMedianSpeed({ context, message }: TaskProps): Promise<AgencyMedianSpeedResult[]> {
	message('Calculating median speeds per agency...');

	const ridesCollection = await rides.getCollection();

	// const startDateStr = Dates.fromOperationalDate(context.dates.start, 'Europe/Lisbon').unix_timestamp;
	// const endDateStr = Dates.fromOperationalDate(context.dates.end, 'Europe/Lisbon').unix_timestamp;

	const pipeline = [
		{
			$match: {
				$expr: { $gt: ['$end_time_observed', '$start_time_observed'] },
				agency_id: { $exists: true },
				end_time_observed: { $exists: true },
				extension_scheduled: { $gt: 0 },
				start_time_observed: { $exists: true },
				// start_time_scheduled: { $gte: startDateStr, $lte: endDateStr },
				operational_date: { $gte: context.dates.start, $lte: context.dates.end },
			},
		},
		{
			$project: {
				agencyId: '$agency_id',
				distanceKilometers: { $divide: ['$extension_scheduled', 1000] },
				durationHours: {
					$divide: [
						{ $subtract: ['$end_time_observed', '$start_time_observed'] },
						60 * 60 * 1000,
					],
				},
			},
		},
		{
			$project: {
				agencyId: 1,
				speedKmPerHour: {
					$cond: [
						{ $gt: ['$durationHours', 0] },
						{ $divide: ['$distanceKilometers', '$durationHours'] },
						0,
					],
				},
			},
		},
		{
			$group: {
				_id: '$agencyId',
				speeds: { $push: '$speedKmPerHour' },
			},
		},
	];

	const aggCursor = ridesCollection.aggregate(pipeline);

	const results: AgencyMedianSpeedResult[] = [];

	for await (const doc of aggCursor) {
		const medianSpeedValue = median(doc.speeds);
		results.push({
			agencyId: doc._id,
			medianSpeed: parseFloat(medianSpeedValue.toFixed(2)),
		});
	}

	message(`Processed ${results.length} agencies`);
	return results;
}
