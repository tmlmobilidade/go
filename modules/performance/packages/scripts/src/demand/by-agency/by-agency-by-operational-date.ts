/* * */

import { demandByAgencyByOperationalDate } from '@tmlmobilidade/databases';

/* * */

export async function runDemandByAgencyByOperationalDate() {
	//

	//
	// Run the aggregation query to populate the table

	await demandByAgencyByOperationalDate.queryFromFile('/Users/joao/Developer/tmlmobilidade/go/modules/performance/sql/demand/by-agency-by-operational-date.sql');

	console.log('Done!');
}
