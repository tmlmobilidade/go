/* * */

import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { type Metric } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import TIMETRACKER from '@helperkits/timer';

type DemandGroupType = 'agency' | 'line' | 'pattern';
type Granularity = 'day' | 'month' | 'year';

const getTimeChunks = (granularity: Granularity) => {
	const earliestDataNeeded = Dates.now('Europe/Lisbon').set(
		{ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 },
	);
	const latest = Dates.now('Europe/Lisbon').set({ hour: 4, millisecond: 0, minute: 0, second: 0 }).plus({ days: 1 });

	const allTimestampChunks: { end: number, label: string, start: number }[] = [];

	let cursor = earliestDataNeeded;
	while (cursor.unix_timestamp < latest.unix_timestamp) {
		let next;
		let label;
		if (granularity === 'day') {
			next = cursor.plus({ days: 1 });
			label = cursor.toFormat('yyyy-LL-dd');
		}
		else if (granularity === 'month') {
			next = cursor.plus({ months: 1 });
			label = cursor.toFormat('yyyy-LL');
		}
		else {
			next = cursor.plus({ years: 1 });
			label = cursor.toFormat('yyyy');
		}
		allTimestampChunks.push({
			end: next.unix_timestamp,
			label,
			start: cursor.unix_timestamp,
		});
		cursor = next;
	}
	return allTimestampChunks;
};

export const syncDemand = async (groupType: DemandGroupType, granularity: Granularity) => {
	Logger.title(`Sync Demand Metrics by ${groupType} by ${granularity}`);
	const globalTimer = new TIMETRACKER();

	const field = `${groupType}_id` as const; // e.g. 'agency_id', 'line_id', 'pattern_id'
	const metricName = `demand_by_${groupType}_by_${granularity}` as const;
	const interval = 300_000;

	const metricsCollection = await metrics.getCollection();

	await metricsCollection.deleteMany({ metric: metricName });

	const validationsCollection = await simplifiedApexValidations.getCollection();

	const chunks = getTimeChunks(granularity);
	const groupMap = new Map<string, Metric>();

	const chunkResults = await Promise.all(
		chunks.map(async (chunk) => {
			const { end, label, start } = chunk;

			const agg = await validationsCollection.aggregate([
				{
					$match: {
						created_at: { $gte: start, $lt: end },
						is_passenger: true,
					},
				},
				{
					$group: {
						_id: `$${field}`,
						count: { $sum: 1 },
						[field]: { $first: `$${field}` },
					},
				},
			]).toArray();

			// for (const item of agg) {
			// 	const id = item[field] ?? 'no-id';
			// 	if (!groupMap.has(id)) {
			// 		groupMap.set(id, {
			// 			data: {},
			// 			description: `Aggregated passenger demand for ${groupType} ${id}`,
			// 			generated_at: new Date(),
			// 			metric: metricName,
			// 			properties: { [field]: id, interval },
			// 		});
			// 	}
			// 	groupMap.get(id).data[label] = { qty: item.count };
			// }
		}),
	);

	await metrics.insertMany([...groupMap.values()]);
	Logger.terminate(`Processed ${groupMap.size} ${groupType} groups (${globalTimer.get()})`);
};
