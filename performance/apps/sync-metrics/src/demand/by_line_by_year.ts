/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { CreateMetricDto } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import { Interval } from 'luxon';

/* * */

export const syncDemandByLineByYear = async () => {
	//
	LOGGER.title(`Sync Demand Metrics by Line by Year`);
	const globalTimer = new TIMETRACKER();

	const validationsCollection = await simplifiedApexValidations.getCollection();

	const distinctTimer = new TIMETRACKER();
	const lineIds = await validationsCollection.distinct('line_id');
	LOGGER.info(`Found ${lineIds.length} distinct lines (${distinctTimer.get()})`);

	const results: CreateMetricDto[] = [];

	const earliestDataNeeded = Dates.fromISO('2024-01-01T04:00:00');

	const allTimestampChunks = Interval
		.fromISO(`${earliestDataNeeded.iso}/${Dates.now('Europe/Lisbon').iso}`)
		.splitBy({ year: 1 })
		.map(interval => ({ end: interval.end.toMillis(), start: interval.start.toMillis() }))
		.sort((a, b) => b.start - a.start);

	const smallerLineIds = lineIds.slice(0, 5);

	for (const lineId of smallerLineIds) {
		if (!lineId) continue;
		//
		const lineDocument: CreateMetricDto = {
			data: {} as Record<string, { qty: number }>,
			description: `Aggregated passenger per year for the line ${lineId}`,
			generated_at: new Date(),
			metric: 'demand_by_line_by_year',
			properties: {
				interval: 300_000,
				line_id: lineId,
			},
			scope: 'demand',
		};

		for (const [chunkIndex, chunkData] of allTimestampChunks.entries()) {
			//

			const chunkTimer = new TIMETRACKER();

			const chunkStartDate = Dates
				.fromUnixTimestamp(chunkData.start)
				.setZone('Europe/Lisbon', 'offset_only');

			const chunkEndDate = Dates
				.fromUnixTimestamp(chunkData.end)
				.setZone('Europe/Lisbon', 'offset_only');

			const year = new Date(chunkStartDate.unix_timestamp).getFullYear();

			LOGGER.info(`Processing line ${lineId} - Year ${year}...`);

			const count = await validationsCollection.countDocuments({
				created_at: { $gte: chunkStartDate.unix_timestamp, $lt: chunkEndDate.unix_timestamp },
				is_passenger: true,
				line_id: lineId,
			});

			lineDocument.data[year] = { qty: count };

			LOGGER.info(`Result for Line ${lineId} - Year ${year}: ${count} validations (${chunkTimer.get()})`);

			LOGGER.spacer(1);
			LOGGER.divider(`[${allTimestampChunks.length - chunkIndex}/${allTimestampChunks.length}] - ${chunkStartDate.iso} to ${chunkEndDate.iso}`, 150);
		}

		results.push(lineDocument);
	}

	await metrics.insertMany(results);

	LOGGER.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
