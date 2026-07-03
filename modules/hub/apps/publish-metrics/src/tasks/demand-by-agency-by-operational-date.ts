/* * */

import { apiCache, demandByAgencyByOperationalDate } from '@tmlmobilidade/databases';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishDemandByAgencyByOperationalDate() {
	//

	Logger.title('Publishing Demand by Agency by Operational Date...');

	const globalTimer = new Timer();

	//
	// Fetch demand by agency by operational date

	const fetchTimer = new Timer();

	const result = await demandByAgencyByOperationalDate.queryFromString<DemandByAgencyByOperationalDate>('SELECT * FROM performance.demand_by_agency_by_operational_date');

	Logger.info({ message: `Fetched ${result.length} demand by agency by operational date in ${fetchTimer.get()}` });

	//
	// Save the result in API Cache

	await apiCache.set('hub:v1:metrics:demand:by-agency:by-operational-date:json', JSON.stringify(result));

	Logger.success(`Finished publishing Demand by Agency by Operational Date (${globalTimer.get()})`);

	//
};
