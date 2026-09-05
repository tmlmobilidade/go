/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type HubV1ApiPlan, HubV1ApiPlanSchema } from '@tmlmobilidade/go-types-hub';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishApprovedPlans() {
	//

	Logger.title('Publishing approved plans JSON feed...');

	const globalTimer = new Timer();

	//
	// Retrieve all plans

	const allPlansData = await goDb.operation.plans.findMany();

	Logger.info({ message: `Retrieved ${allPlansData.length} approved plans...` });

	//
	// For each plan, get the file URL

	const plansWithOperationFiles = await Promise.all(
		allPlansData.map(async (planData) => {
			const operationFile = await storageProvider.findById(planData.operation_file_id);
			if (!operationFile) throw new Error(`Operation file not found for plan ${planData._id}`);
			const agencyData = await goDb.core.agencies.findById(planData.agency_id);
			if (!agencyData) throw new Error(`Agency not found for plan ${planData._id}`);
			return { agencyData, operationFile, planData };
		}),
	);

	//
	// Parse the plans

	const approvedPlans: HubV1ApiPlan[] = [];

	for (const { agencyData, operationFile, planData } of plansWithOperationFiles) {
		try {
			// Check if the operation file exists
			if (!operationFile) throw new Error(`Operation file not found for plan ${planData._id}`);
			// Check if the plans is active
			const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date_int;
			const nowIsAfterStartDate = currentOperationalDate >= planData.active_from;
			const nowIsBeforeEndDate = currentOperationalDate <= planData.active_until;
			const isActive = nowIsAfterStartDate && nowIsBeforeEndDate;
			// Parse the plan data
			const hubPlanData: HubV1ApiPlan = {
				_id: planData._id,
				active_from: planData.active_from,
				active_until: planData.active_until,
				agency_code: agencyData.code,
				agency_id: planData.agency_id,
				agency_name: agencyData.name,
				created_at: planData.created_at,
				hash: planData.hash,
				is_active: isActive,
				operation_file_id: planData.operation_file_id,
				operation_file_url: operationFile.url,
				updated_at: planData.updated_at,
			};
			const validatedHubV1ApiPlanData = HubV1ApiPlanSchema.safeParse(hubPlanData);
			if (!validatedHubV1ApiPlanData.success) throw new Error(`Error parsing plan ${planData._id}: ${validatedHubV1ApiPlanData.error.message}`);
			// Add the plan to the list
			approvedPlans.push(validatedHubV1ApiPlanData.data);
		} catch (error) {
			Logger.error({ message: `Error parsing plan ${planData._id}: ${(error as Error).message}` });
		}
	}

	Logger.info({ message: `Parsed ${approvedPlans.length} approved plans...` });

	//
	// Save the result in API Cache

	await cacheDb.set('hub:v1:plans:approved:json', JSON.stringify(approvedPlans));

	Logger.success(`Finished publishing ${approvedPlans.length} approved plans JSON feed. (${globalTimer.get()})`);

	//
};
