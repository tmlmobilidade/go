import { type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { simplifiedApexOnBoardSales } from '@tmlmobilidade/interfaces';

/* Interface for the result */
export interface OnBoardSalesMetricResult {
	'agencyId': string
	'date': string
	'onboard-sales-pr': number
}

/* Main function */
export async function calculateOnBoardSales({ context, message }: TaskProps): Promise<OnBoardSalesMetricResult[]> {
	message('Calculating on-board sales...');

	const collection = await simplifiedApexOnBoardSales.getCollection();

	// Convert received dates (yyyymmdd) to UTC range
	const start = context.dates.start;
	const end = context.dates.end;

	const startDate = Dates.fromOperationalDate(start, 'Europe/Lisbon').unix_timestamp;
	const endDate = Dates.fromOperationalDate(end, 'Europe/Lisbon').unix_timestamp;

	// MongoDB pipeline based on your query
	const pipeline = [
		{
			$match: {
				agency_id: { $exists: true },
				created_at: { $gte: startDate, $lte: endDate },
				is_passenger: true,
			},
		},
		{
			$group: {
				_id: '$agency_id',
				totalRevenueCents: { $sum: '$price' },
			},
		},
		{
			$project: {
				_id: 0,
				agencyId: '$_id',
				totalRevenue: {
					$divide: ['$totalRevenueCents', 100], // convert to euros
				},
			},
		},
		{
			$sort: { agencyId: 1 },
		},
	];

	const cursor = collection.aggregate<{
		agencyId: string
		totalRevenue: number
	}>(pipeline);

	const results: OnBoardSalesMetricResult[] = [];

	// console.log('Pipeline results:', JSON.stringify(pipeline, null, 2));

	for await (const doc of cursor) {
		// Since the original query has no date, use startDate as reference
		const date = new Date(startDate);
		const day = date.getUTCDate().toString().padStart(2, '0');
		const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
		const year = date.getUTCFullYear();
		const formattedDate = `${day}/${month}/${year}`;

		results.push({
			'agencyId': doc.agencyId,
			'date': formattedDate,
			'onboard-sales-pr': parseFloat(doc.totalRevenue.toFixed(2)),
		});
	}

	message(`Processed ${results.length} on-board sales records`);

	return results;
}
