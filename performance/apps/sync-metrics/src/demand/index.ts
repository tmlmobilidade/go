/* * */
import { syncDemandByLineByDay } from '@/demand/by_line_by_day.js';
import { syncDemandByLineByMonth } from '@/demand/by_line_by_month.js';
import { syncDemandByLineByYear } from '@/demand/by_line_by_year.js';

/* * */

//
// Run once every 24 hours

const RUN_INTERVAL = 86_400_000;

/* * */

export const syncDemandMetrics = async () => {
	//

	const runOnInterval = async () => {
		await syncDemandByLineByYear();
		await syncDemandByLineByMonth();
		await syncDemandByLineByDay();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};

	runOnInterval();

	//
};
