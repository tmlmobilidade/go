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
import { Logger } from '@go/utils-logger';
import TIMETRACKER from '@helperkits/timer';

/* * */

export const syncDemandMetrics = async () => {
	//

	const runOnInterval = async () => {
		//

		const globalTimer = new TIMETRACKER();

		Logger.title(`Starting Demand Metrics Sync`);
		Logger.divider();

		await syncDemandByLineByYear();
		await syncDemandByLineByMonth();
		await syncDemandByLineByDay();

		await computeMeanDemandByLineByMonth();
		await computeTopMeanDemandByLineByMonth();

		//

		Logger.divider();
		Logger.title(`Starting Agency Demand Metrics Sync`);
		Logger.divider();

		await syncDemandByAgencyByYear();
		await syncDemandByAgencyByMonth();
		await syncDemandByAgencyByDay();

		await computeTopDemandByAgency();

		//

		Logger.divider();
		Logger.title(`Starting Pattern Demand Metrics Sync`);
		Logger.divider();

		await syncDemandByPatternByYear();
		await syncDemandByPatternByMonth();
		await syncDemandByPatternByDay();

		//

		Logger.divider();
		Logger.title(`Starting Pattern Hour Demand Metrics Sync`);
		Logger.divider();

		await syncDemandByPatternHourByYear();
		await syncDemandByPatternHourByMonth();

		//

		Logger.divider();
		Logger.terminate(`Finished Demand Metrics Sync (${globalTimer.get()})`);
		Logger.divider();

		setTimeout(runOnInterval, 3_600_000); // 1 hour
	};

	runOnInterval();

	//
};
