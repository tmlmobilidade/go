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
import TIMETRACKER from '@helperkits/timer';
import { Logs } from '@tmlmobilidade/go-utils';

/* * */

export const syncDemandMetrics = async () => {
	//

	const runOnInterval = async () => {
		//

		const globalTimer = new TIMETRACKER();

		Logs.title(`Starting Demand Metrics Sync`);
		Logs.divider();

		await syncDemandByLineByYear();
		await syncDemandByLineByMonth();
		await syncDemandByLineByDay();

		await computeMeanDemandByLineByMonth();
		await computeTopMeanDemandByLineByMonth();

		//

		Logs.divider();
		Logs.title(`Starting Agency Demand Metrics Sync`);
		Logs.divider();

		await syncDemandByAgencyByYear();
		await syncDemandByAgencyByMonth();
		await syncDemandByAgencyByDay();

		await computeTopDemandByAgency();

		//

		Logs.divider();
		Logs.title(`Starting Pattern Demand Metrics Sync`);
		Logs.divider();

		await syncDemandByPatternByYear();
		await syncDemandByPatternByMonth();
		await syncDemandByPatternByDay();

		//

		Logs.divider();
		Logs.title(`Starting Pattern Hour Demand Metrics Sync`);
		Logs.divider();

		await syncDemandByPatternHourByYear();
		await syncDemandByPatternHourByMonth();

		//

		Logs.divider();
		Logs.terminate(`Finished Demand Metrics Sync (${globalTimer.get()})`);
		Logs.divider();

		setTimeout(runOnInterval, 3_600_000); // 1 hour
	};

	runOnInterval();

	//
};
