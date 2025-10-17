import { logMetricToFile } from '@/logMetrics.js';
import TIMETRACKER from '@helperkits/timer';
import { metrics } from '@tmlmobilidade/interfaces';
import { Metric } from '@tmlmobilidade/types';
import { Logs } from '@tmlmobilidade/utils';

export const computeTopDemandByAgency = async () => {
	//

	Logs.title('Compute Top Demand By Agency');
	const globalTimer = new TIMETRACKER();

	const METRIC = 'top_demand_by_agency';

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	Logs.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logs.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch metrics collection

	const metricsCollection = await metrics.getCollection();

	//
	// Per operator: find top day

	const topByOperator = await metricsCollection.aggregate([
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
	]).toArray();

	//
	// Global total: sum all qtys by date, find top

	const topTotal = await metricsCollection.aggregate([
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
	]).toArray();

	//
	// Transform result into Metric objects

	const operators = Object.fromEntries(
		topByOperator.map(o => [
			o._id,
			{ date: o.topDate, qty: o.topQty },
		]),
	);

	const total = {
		date: topTotal[0]._id,
		qty: topTotal[0].totalQty,
	};

	const metricDoc = {
		data: { operators, total },
		description: 'Top day with highest passenger count overall and per operator',
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

	Logs.terminate(`Metric computed and inserted in ${globalTimer.get()}`);
};

//
