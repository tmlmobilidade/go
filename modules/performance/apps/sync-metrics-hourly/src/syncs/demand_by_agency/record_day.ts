import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Metric } from '@tmlmobilidade/types';

export const computeTopDemandByAgency = async () => {
	//

	Logger.title('Compute Top Demand By Agency');
	const globalTimer = new Timer();

	const METRIC = 'top_demand_by_agency';

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
	// Calculate top demand days and months

	const topDayByOperator = await metricsCollection
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
					qty: '$dataArray.v.qty',
				},
			},
			{ $sort: { agency_id: 1, qty: -1 } },
			{
				$group: {
					_id: '$agency_id',
					topDate: { $first: '$date' },
					topQty: { $first: '$qty' },
				},
			},
		])
		.toArray();

	const topMonthByOperator = await metricsCollection
		.aggregate([
			{ $match: { metric: 'demand_by_agency_by_month' } },
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
					month: '$dataArray.k',
					qty: '$dataArray.v.qty',
				},
			},
			{ $sort: { agency_id: 1, qty: -1 } },
			{
				$group: {
					_id: '$agency_id',
					topMonth: { $first: '$month' },
					topQty: { $first: '$qty' },
				},
			},
		])
		.toArray();

	const [topDayTotal] = await metricsCollection
		.aggregate([
			{ $match: { metric: 'demand_by_agency_by_day' } },
			{
				$project: {
					dataArray: { $objectToArray: '$data' },
				},
			},
			{ $unwind: '$dataArray' },
			{
				$group: {
					_id: '$dataArray.k',
					totalQty: { $sum: '$dataArray.v.qty' },
				},
			},
			{ $sort: { totalQty: -1 } },
			{ $limit: 1 },
		])
		.toArray();

	const [topMonthTotal] = await metricsCollection
		.aggregate([
			{ $match: { metric: 'demand_by_agency_by_month' } },
			{
				$project: {
					dataArray: { $objectToArray: '$data' },
				},
			},
			{ $unwind: '$dataArray' },
			{
				$group: {
					_id: '$dataArray.k',
					totalQty: { $sum: '$dataArray.v.qty' },
				},
			},
			{ $sort: { totalQty: -1 } },
			{ $limit: 1 },
		])
		.toArray();

	//
	// Merge results
	const topMonthMap = Object.fromEntries(
		topMonthByOperator.map(o => [o._id, o]),
	);

	const agencies = Object.fromEntries(
		topDayByOperator.map((o) => {
			const month = topMonthMap[o._id];
			return [
				o._id,
				{
					day: { date: o.topDate, qty: o.topQty },
					month: month ? { date: month.topMonth, qty: month.topQty } : null,
				},
			];
		}),
	);

	const total = {
		day: { date: topDayTotal?._id, qty: topDayTotal?.totalQty ?? 0 },
		month: { date: topMonthTotal?._id, qty: topMonthTotal?.totalQty ?? 0 },
	};

	const metricDoc = {
		data: { agencies, total },
		description: 'Top day and month with highest passenger count overall and per agency',
		generated_at: new Date(),
		metric: METRIC,
	} as Metric;

	//
	// Insert metric

	await metricsCollection.insertOne(metricDoc);

	logMetricToFile({
		approach: { description: 'Aggregate metric demand_by_agency_by_day', key: 'aggregate_demand_by_agency_by_day' },
		metric: METRIC,
		queryCount: 2,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Metric computed and inserted in ${globalTimer.get()}`);
};

//
