import { type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';

export interface PassengersPerKmResult {
	agencyId: string
	passengersPerKm: number
	totalKm: number
	totalPassengers: number
}

export async function calculatePassengersPerKm({ context }: TaskProps): Promise<PassengersPerKmResult[]> {
	console.log('Calculating passengers per km for executed trips...');

	const ridesCollection = await rides.getCollection();

	const startDateStr = Dates.fromOperationalDate(context.dates.start, 'Europe/Lisbon').unix_timestamp;
	const endDateStr = Dates.fromOperationalDate(context.dates.end, 'Europe/Lisbon').unix_timestamp;

	console.log(`Date range: ${startDateStr} to ${endDateStr}`);

	const pipeline = [
		{
			$match: {
				agency_id: { $exists: true },
				start_time_scheduled: { $gte: startDateStr, $lte: endDateStr },
			},
		},
		{
			$project: {
				agencyId: '$agency_id',
				extensionScheduled: '$extension_scheduled',
				isValid: {
					$or: [
						{ $eq: ['$analysis.SIMPLE_ONE_APEX_VALIDATION.grade', 'pass'] },
						{ $eq: ['$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade', 'pass'] },
					],
				},
				passengersObserved: '$passengers_observed',
			},
		},
		{
			$group: {
				_id: { agencyId: '$agencyId' },
				totalKm: { $sum: { $cond: ['$isValid', '$extensionScheduled', 0] } },
				totalPassengers: { $sum: { $cond: ['$isValid', '$passengersObserved', 0] } },
			},
		},
		{
			$project: {
				_id: 0,
				agencyId: '$_id.agencyId',
				passengersPerKm: {
					$cond: [
						{ $eq: ['$totalKm', 0] },
						0,
						{
							$round: [
								{ $divide: ['$totalPassengers', { $divide: ['$totalKm', 1000] }] },
								2,
							],
						},
					],
				},
				totalKm: 1,
				totalPassengers: 1,
			},
		},
	];

	const aggCursor = ridesCollection.aggregate(pipeline);

	const results: PassengersPerKmResult[] = [];

	for await (const doc of aggCursor) {
		// // Total Passengers, Km, passengersPerKm DEBUG
		// console.log(
		// 	`[DEBUG] Agency: ${doc.agencyId} | Total Passengers: ${doc.totalPassengers} | Total Km: ${doc.totalKm} | passengersPerKm: ${doc.passengersPerKm}`,
		// );

		results.push({
			agencyId: doc.agencyId,
			passengersPerKm: doc.passengersPerKm,
			totalKm: doc.totalKm,
			totalPassengers: doc.totalPassengers,
		});
	}

	console.log(`Processed ${results.length} agencies for the interval.`);

	return results;
}
