/* * */

import { metrics, simplifiedApexValidations } from '@go/interfaces';
import { type RealtimeDemand } from '@go/types';
import { Dates } from '@go/dates';
import { Logger } from '@go/logger';
import TIMETRACKER from '@helperkits/timer';

/* * */

export const syncRealtimeDemand = async () => {
	//

	Logger.title(`Sync Demand Metrics in Realtime`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'realtime_demand';

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch validations collection

	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Setup the timestamp boundary
	// This takes in consideration the current time, as we want to compare today so far with the previous day so far, also.
	// For example, today is monday 10h49. We want to compare the number of validations until 10h49 of today with the number of validations until 10h49 of last monday.

	const currentOperationalDate = Dates
		.now('Europe/Lisbon')
		.operational_date;

	const currentOperationalDateAsUnixTimestamp = Dates
		.fromOperationalDate(currentOperationalDate, 'Europe/Lisbon')
		.startOf('day')
		.set({ hour: 4 })
		.unix_timestamp;

	const previousOperationalDate = Dates
		.now('Europe/Lisbon')
		.minus({ days: 7 })
		.operational_date;

	const previousOperationalDateAsUnixTimestamp = Dates
		.fromOperationalDate(previousOperationalDate, 'Europe/Lisbon')
		.startOf('day')
		.set({ hour: 4 })
		.unix_timestamp;

	const previousUntilNowAsUnixTimestamp = Dates
		.now('Europe/Lisbon')
		.minus({ days: 7 })
		.unix_timestamp;

	//
	// Define operators

	const operators = ['41', '42', '43', '44'];
	const results: RealtimeDemand['data'] = {
		operators: {},
		total: {
			last_week: 0,
			now: 0,
		},
	};

	//
	// Count validations per operator

	for (const operatorId of operators) {
		const operatorTimer = new TIMETRACKER();
		Logger.info(`Processing Operator ${operatorId}...`);

		//
		// Count validations for today so far

		const todayValidCount = await validationsCollection.countDocuments({
			agency_id: operatorId,
			created_at: { $gte: currentOperationalDateAsUnixTimestamp },
			is_passenger: true,
		});

		//
		// Count validations for previous operational date so far

		const lastWeekValidCount = await validationsCollection.countDocuments({
			agency_id: operatorId,
			created_at: {
				$gte: previousOperationalDateAsUnixTimestamp,
				$lte: previousUntilNowAsUnixTimestamp,
			},
			is_passenger: true,
		});

		//
		// Store results

		results.operators[operatorId] = {
			last_week: lastWeekValidCount,
			now: todayValidCount,
		};
		results.total.last_week += lastWeekValidCount;
		results.total.now += todayValidCount;

		Logger.info(`Processed Operator ${operatorId} in ${operatorTimer.get()}`);
	}

	const metricToInsert: RealtimeDemand = {
		data: results,
		description: `Realtime Demand Metrics by operators and for all CM, compared with previous week in the same day period.`,
		generated_at: new Date(),
		metric: METRIC,
	};

	//
	// Insert metric

	await metrics.insertOne(metricToInsert);

	Logger.terminate(`Processed ${METRIC} (${globalTimer.get()})`);
};

//
