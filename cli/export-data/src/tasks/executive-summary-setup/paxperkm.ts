import { type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';

export interface PassengersPerKmResult {
	agencyId: string
	date: string
	passengersPerKm: number
}

export async function calculatePassengersPerKm({ context, message }: TaskProps): Promise<PassengersPerKmResult[]> {
	message('Calculating passengers per km for executed trips...');

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
				passengersPerKm: {
					$sum: {
						$cond: [
							{
								$or: [
									{ $eq: ['$analysis.SIMPLE_ONE_APEX_VALIDATION.grade', 'pass'] },
									{ $eq: ['$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade', 'pass'] },
								],
							},
							{ $divide: ['$passengers_observed', '$extension_scheduled'] },
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
				date: '$_id.date',
				passengersPerKm: { $round: ['$passengersPerKm', 0] },
			},
		},
	];

	const aggCursor = ridesCollection.aggregate(pipeline);

	const results: PassengersPerKmResult[] = [];

	for await (const doc of aggCursor) {
		const formattedDate = Dates.fromOperationalDate(doc.date, 'Europe/Lisbon').toFormat('dd/MM/yyyy');
		results.push({
			agencyId: doc.agencyId,
			date: formattedDate,
			passengersPerKm: doc.passengersPerKm,
		});
	}

	message(`Processed ${results.length} passengers per km metrics`);

	return results;
}
