/* * */

import { syncDemandByAgencyByDay } from '@/demand/by_agency/by_day.js';
import { syncDemandByAgencyByMonth } from '@/demand/by_agency/by_month.js';
import { syncDemandByAgencyByYear } from '@/demand/by_agency/by_year.js';
import { computeTopDemandByAgency } from '@/demand/by_agency/record_day.js';
import { syncDemandByLineByDay } from '@/demand/by_line/by_day.js';
import { syncDemandByLineByMonth } from '@/demand/by_line/by_month.js';
import { syncDemandByLineByYear } from '@/demand/by_line/by_year.js';
import { computeMeanDemandByLineByMonth } from '@/demand/by_line/mean_by_month.js';
import { computeTopMeanDemandByLineByMonth } from '@/demand/by_line/top_mean_by_month.js';
import { syncDemandByPatternByDay } from '@/demand/by_pattern/by_day.js';
import { syncDemandByPatternByMonth } from '@/demand/by_pattern/by_month.js';
import { syncDemandByPatternByYear } from '@/demand/by_pattern/by_year.js';
import { syncDemandByPatternHourByMonth } from '@/demand/by_pattern_hour/by_month.js';
import { syncDemandByPatternHourByYear } from '@/demand/by_pattern_hour/by_year.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { MetricBasePropertiesSchema } from '@tmlmobilidade/types';

/* * */

//
// Run once every 1 hour

const parsed = MetricBasePropertiesSchema.parse({});
const RUN_INTERVAL = parsed.interval;

/* * */

export const syncDemandMetrics = async () => {
	//

	const runOnInterval = async () => {
		//

		const globalTimer = new TIMETRACKER();

		LOGGER.title(`Starting Demand Metrics Sync`);
		LOGGER.divider();

		await syncDemandByLineByYear();
		await syncDemandByLineByMonth();
		await syncDemandByLineByDay();

		await computeMeanDemandByLineByMonth();
		await computeTopMeanDemandByLineByMonth();

		//

		LOGGER.divider();
		LOGGER.title(`Starting Agency Demand Metrics Sync`);
		LOGGER.divider();

		await syncDemandByAgencyByYear();
		await syncDemandByAgencyByMonth();
		await syncDemandByAgencyByDay();

		await computeTopDemandByAgency();

		//

		LOGGER.divider();
		LOGGER.title(`Starting Pattern Demand Metrics Sync`);
		LOGGER.divider();

		await syncDemandByPatternByYear();
		await syncDemandByPatternByMonth();
		await syncDemandByPatternByDay();

		//

		LOGGER.divider();
		LOGGER.title(`Starting Pattern Hour Demand Metrics Sync`);
		LOGGER.divider();

		await syncDemandByPatternHourByYear();
		await syncDemandByPatternHourByMonth();

		//

		LOGGER.divider();
		LOGGER.terminate(`Finished Demand Metrics Sync (${globalTimer.get()})`);
		LOGGER.divider();

		setTimeout(runOnInterval, RUN_INTERVAL);
	};

	runOnInterval();

	//
};
