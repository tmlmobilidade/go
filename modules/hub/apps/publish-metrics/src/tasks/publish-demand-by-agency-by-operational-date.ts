/* * */

import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/* * */

export async function publishDemandByAgencyByOperationalDate() {
	//

	Logger.title('Publishing Demand by Agency by Operational Date...');

	const globalTimer = new Timer();

	//
	// Fetch demand by agency by operational date

	const fetchTimer = new Timer();

	const result = await labDb.performance.demandByAgencyByOperationalDate.queryFromString('SELECT * FROM performance.demand_by_agency_by_operational_date');

	Logger.info({ message: `Fetched ${result.length} demand by agency by operational date in ${fetchTimer.get()}` });

	//
	// Save the result in API Cache

	for (const organization of await goDb.core.organizations.findMany()) {
		try {
			const organizationDemand = result.filter(row => organization.agency_ids.includes(row.agency_id));
			await cacheDb.set(getOrganizationCacheKey(organization._id, 'metrics:demand:by-agency:by-operational-date:json'), JSON.stringify(organizationDemand));
		} catch (error) {
			Logger.error({ error, message: `Error publishing metrics for organization ${organization._id}.` });
		}
	}

	Logger.success(`Finished publishing Demand by Agency by Operational Date (${globalTimer.get()})`);

	//
};
