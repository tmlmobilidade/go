import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Metric } from '@tmlmobilidade/types';

export const computeTopDemandByAgencyByDayType = async () => {
	//

	Logger.title('Compute Top Demand By Agency by Day Type');
	const globalTimer = new Timer();

	const METRIC = 'top_demand_by_agency_by_day_type';

	//
	// Delete existing metrics
	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${METRIC}' metrics...` });
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch metrics collection
	const metricsCollection = await metrics.getCollection();

	//
	// Compute top 5 days by agency and day type
	const agencyResults = await metricsCollection
		.aggregate([
			{ $match: { metric: 'demand_by_agency_by_day' } },
			{
				$project: {
					agency_id: '$properties.agency_id',
					dataArray: { $objectToArray: '$data' },
				},
			},
			{ $unwind: '$dataArray' },
			{
				$project: {
					agency_id: 1,
					date: '$dataArray.k',
					day_type: '$dataArray.v.day_type',
					qty: '$dataArray.v.qty',
				},
			},
			// Add filter to ensure we only get valid day types and qty values
			{
				$match: {
					day_type: { $in: ['1', '2', '3'] },
					qty: { $gt: 0 },
				},
			},
			// Group by unique combination and take max qty (in case of duplicates)
			{
				$group: {
					_id: { agency_id: '$agency_id', date: '$date', day_type: '$day_type' },
					qty: { $max: '$qty' }, // Use max instead of sum to avoid double counting
				},
			},
			{ $sort: { '_id.agency_id': 1, '_id.day_type': 1, 'qty': -1 } },
			{
				$group: {
					_id: { agency_id: '$_id.agency_id', day_type: '$_id.day_type' },
					topDays: { $push: { date: '$_id.date', qty: '$qty' } },
				},
			},
			{ $project: { topDays: { $slice: ['$topDays', 5] } } },
		])
		.toArray();

	//
	// Compute total top 5 days across all agencies, grouped by day type
	const totalResults = await metricsCollection
		.aggregate([
			{ $match: { metric: 'demand_by_agency_by_day' } },
			{
				$project: {
					dataArray: { $objectToArray: '$data' },
				},
			},
			{ $unwind: '$dataArray' },
			{
				$project: {
					date: '$dataArray.k',
					day_type: '$dataArray.v.day_type',
					qty: '$dataArray.v.qty',
				},
			},
			// Add filter to ensure we only get valid day types and qty values
			{
				$match: {
					day_type: { $in: ['1', '2', '3'] },
					qty: { $gt: 0 },
				},
			},
			{
				$group: {
					_id: { date: '$date', day_type: '$day_type' },
					totalQty: { $sum: '$qty' }, // Sum across all agencies for total
				},
			},
			{ $sort: { '_id.day_type': 1, 'totalQty': -1 } },
			{
				$group: {
					_id: '$_id.day_type',
					topDays: { $push: { date: '$_id.date', qty: '$totalQty' } },
				},
			},
			{ $project: { topDays: { $slice: ['$topDays', 5] } } },
		])
		.toArray();

	//
	// Format data output
	const data = {
		agencies: {},
		total: {},
	};

	for (const doc of agencyResults) {
		const { agency_id, day_type } = doc._id;
		const key = `day_type_${day_type}`;

		if (!data.agencies[agency_id]) data.agencies[agency_id] = {};
		if (!data.agencies[agency_id][key]) data.agencies[agency_id][key] = {};

		doc.topDays.forEach(({ date, qty }) => {
			data.agencies[agency_id][key][date] = qty;
		});
	}

	for (const doc of totalResults) {
		const key = `day_type_${doc._id}`;
		data.total[key] = {};

		doc.topDays.forEach(({ date, qty }) => {
			data.total[key][date] = qty;
		});
	}

	//
	// Build metric document
	const metricDoc = {
		data,
		description: 'Top 5 days with highest passenger counts per agency and per day type (useful days, saturdays, sundays/holidays)',
		generated_at: new Date(),
		metric: METRIC,
	} as Metric;

	//
	// Insert metric
	await metricsCollection.insertOne(metricDoc);

	logMetricToFile({
		approach: {
			description: 'Aggregate top 5 demand days per agency and day type (from demand_by_agency_by_day)',
			key: 'aggregate_top_demand_by_agency_by_day_type',
		},
		metric: METRIC,
		queryCount: 2,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Metric '${METRIC}' computed and inserted in ${globalTimer.get()}`);
};
