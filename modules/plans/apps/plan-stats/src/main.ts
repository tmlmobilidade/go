/* * */

import { importGtfsToDatabase } from '@tmlmobilidade/import-gtfs';
import { plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { computePlanVkm, logVkmPerPatternSummary } from './compute-plan-vkm.js';
import { agencyIdToArea, type PlanVkmRow, writeVkmOutputSheets } from './write-vkm-csv.js';

export async function main() {
	//

	//
	// Retrieve plans from the database and iterate on each one.
	// Change the findMany filter to select specific plan(s), or use {} for all plans.

	const allPlansData = await plans.findMany({}, { sort: { 'gtfs_feed_info.feed_start_date': 1 } });

	if (allPlansData.length === 0) return Logger.terminate('No Plans found. Exiting...');

	Logger.info(`Found ${allPlansData.length} Plans to process...`);

	const planRows: PlanVkmRow[] = [];

	for (const [planIndex, planData] of allPlansData.entries()) {
		//

		const planTimer = new Timer();
		const agencyId = planData.gtfs_agency.agency_id;

		Logger.info(`[${planIndex + 1}/${allPlansData.length}] - Agency ${agencyId} - Plan ${planData._id}`);

		//
		// Import the full GTFS into a SQLite database (no date-range filtering).

		const importTimer = new Timer();

		const importedGtfsSql = await importGtfsToDatabase(planData);

		Logger.success(`Imported plan ${planData._id} in ${importTimer.get()}.`);

		//
		// Compute the plan's VKM.

		const result = await computePlanVkm(planData, importedGtfsSql);

		logVkmPerPatternSummary(
			planData,
			result.analysisRange,
			result.statsByPattern,
			result.patterns_skipped_no_extension,
		);

		planRows.push({
			agency_id: agencyId,
			area: agencyIdToArea(agencyId),
			feed_end_date: planData.gtfs_feed_info.feed_end_date,
			feed_start_date: planData.gtfs_feed_info.feed_start_date,
			plan: planData,
			result,
		});

		Logger.success(`Plan ${planData._id} processed in ${planTimer.get()}.`);
	}

	if (planRows.length === 0) {
		return Logger.terminate('No plan VKM results to write. Exiting...');
	}

	await writeVkmOutputSheets(planRows);

	Logger.success(`CSV outputs written to output/`);
}
