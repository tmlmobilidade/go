/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';
import crypto from 'node:crypto';

/* * */

let PREVIOUS_PLANS_LIST_HASH: null | string = null;

/* * */

export async function getActivePlans(): Promise<Plan[]> {
	//

	//
	// Retrieve all agencies from the database
	// that have the gtfs export enabled

	const allAgenciesWithGtfsEnabled = await goDb.core.agencies.findMany({
		'open_data.services.gtfs_enabled': true,
	});

	if (!allAgenciesWithGtfsEnabled.length) {
		Logger.info({ message: 'No Agencies with GTFS export enabled found.' });
		return [];
	}

	//
	// Retrieve all Plans from the database

	const allPlansData = await goDb.operation.plans.findMany({
		agency_id: { $in: allAgenciesWithGtfsEnabled.map(agency => agency._id) },
	});

	if (allPlansData.length === 0) {
		Logger.terminate('No Plans found. Exiting...');
		return [];
	}

	//
	// Evaluate each plan to check if it should be included in the export

	const currentOperationalDate = Dates.now('utc').operational_date_int;

	const plansToExport = allPlansData.filter((plan) => {
		if (!plan.operation_file_id) return false;
		if (!plan.active_from) return false;
		if (!plan.active_until) return false;
		if (plan.active_until < currentOperationalDate) return false;
		return true;
	});

	Logger.info({ message: `Found ${plansToExport.length} Plans to export...` });

	//
	// Hash the list of enabled plans and check if it differs
	// from previous hash stored in memory.

	const currentPlansListHash = crypto
		.createHash('sha1')
		.update(JSON.stringify(plansToExport.map(plan => plan.hash)))
		.digest('hex');

	if (PREVIOUS_PLANS_LIST_HASH === currentPlansListHash) {
		Logger.terminate('No changes detected in Plans list since last export. Skipping this run...');
		return [];
	}

	PREVIOUS_PLANS_LIST_HASH = currentPlansListHash;

	//
	// Return the list of plans to export

	return plansToExport;
}
