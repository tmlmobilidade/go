/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { files, plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type Plan } from '@tmlmobilidade/types';

/* * */

interface PlanWithFileUrl extends Plan {
	operation_file_url: string
}

/* * */

export async function publishApprovedPlansFeed() {
	//

	Logger.title('Publishing approved plans feed...');

	const globalTimer = new Timer();

	//
	// Retrieve all plans

	const allPlans = await plans.all();

	Logger.info(`Retrieved ${allPlans.length} approved plans...`);

	//
	// For each plan, get the file URL

	const plansWithFiles: PlanWithFileUrl[] = await Promise.all(
		allPlans.map(async (plan) => {
			const file = await files.findById(plan.operation_file_id);
			return { ...plan, operation_file_url: file.url };
		}),
	);

	Logger.info(`Added File URL to ${plansWithFiles.length} plans...`);

	//
	// Save the result in API Cache

	await apiCache.set('hub:plans:approved:json', JSON.stringify(plansWithFiles));

	Logger.success(`Finished publishing approved plans feed. (${globalTimer.get()})`);

	//
};
