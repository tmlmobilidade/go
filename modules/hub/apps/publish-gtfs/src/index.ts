/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization } from '@tmlmobilidade/go-types-core';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import crypto from 'node:crypto';

import { exportOrganizationGtfs } from './tasks/export-organization.js';
import { getActivePlans } from './utils/get-active-plans.js';

/* * */

const previousExportHashes = new Map<string, string>();

/* * */

async function main() {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Each enabled organization publishes a feed containing its agencies.

	const organizations = await goDb.core.organizations.findMany({ 'open_data.services.gtfs_enabled': true });
	const enabledOrganizationIds = new Set(organizations.map(organization => organization._id));

	for (const organizationId of previousExportHashes.keys()) {
		if (!enabledOrganizationIds.has(organizationId)) previousExportHashes.delete(organizationId);
	}

	const organizationExports: { activePlans: Plan[], organization: Organization }[] = [];
	const failedAgencyIds = new Set<string>();

	for (const organization of organizations) {
		try {
			const activePlans = await getActivePlans(organization.agency_ids);
			organizationExports.push({ activePlans, organization });
		} catch (error) {
			organization.agency_ids.forEach(agencyId => failedAgencyIds.add(agencyId));
			Logger.error({ error, message: `Error selecting GTFS plans for organization ${organization._id}.` });
		}
	}

	//
	// Only skip plans absent from every enabled organization's export.
	// Agencies may belong to more than one organization.

	const plansCollection = await goDb.operation.plans.getCollection();
	const activePlanIds = organizationExports.flatMap(item => item.activePlans.map(plan => plan._id));

	await plansCollection.updateMany({ '_id': { $nin: activePlanIds }, 'agency_id': { $nin: [...failedAgencyIds] }, 'apps.hub_publish_gtfs.status': { $ne: 'skipped' } }, {
		$set: {
			'apps.hub_publish_gtfs.message': null,
			'apps.hub_publish_gtfs.status': 'skipped',
			'apps.hub_publish_gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds,
		},
	});

	for (const { activePlans, organization } of organizationExports) {
		//
		// Include membership, organization ID and date so configuration changes
		// and plan activation dates trigger an export. Cache only successful runs.

		const exportHash = crypto.createHash('sha1').update(JSON.stringify({
			agency_ids: [...organization.agency_ids].sort(),
			date: Dates.now('Europe/Lisbon').operational_date_int,
			organization_id: organization._id,
			plans: [...activePlans].sort((a, b) => a._id.localeCompare(b._id)).map(plan => ({
				_id: plan._id,
				active_from: plan.active_from,
				active_until: plan.active_until,
				agency_id: plan.agency_id,
				attachment: plan.attachments.operation_gtfs_normalized,
				hash: plan.hash,
			})),
		})).digest('hex');

		if (previousExportHashes.get(organization._id) === exportHash) continue;

		try {
			await exportOrganizationGtfs(organization, activePlans);
			previousExportHashes.set(organization._id, exportHash);
		} catch (error) {
			Logger.error({ error, message: `Error publishing GTFS for organization ${organization.short_name}.` });
		}
	}

	Logger.terminate(`Run took ${globalTimer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '10s', throwOnError: false });
