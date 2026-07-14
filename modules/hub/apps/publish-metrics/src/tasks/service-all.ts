/* * */

import { apiCache, serviceAll } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { type ServiceAll } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishAllServiceMetrics() {
	//

	Logger.title('Publishing Service Metrics...');

	const globalTimer = new Timer();

	//
	// Get operational context

	const endOperationalDate = Dates
		.now('Europe/Lisbon')
		.minus({ days: 1 })
		.operational_date_int;

	const startOperationalDate = Dates
		.now('Europe/Lisbon')
		.minus({ days: 15 })
		.operational_date_int;

	//
	// Fetch service metrics

	const fetchTimer = new Timer();

	const result = await serviceAll.queryFromString<ServiceAll>(
		`
			SELECT *
			FROM performance.service_all
			WHERE
				agency_id IN ('41', '42', '43', '44')
				AND operational_date BETWEEN $1 AND $2
			ORDER BY
				operational_date ASC,
				line_id ASC
		`,
		{
			1: startOperationalDate,
			2: endOperationalDate,
		},
	);

	Logger.info({ message: `Fetched ${result.length} service metrics in ${fetchTimer.get()}` });

	//
	// Save the result in API Cache

	await apiCache.set('hub:v1:metrics:service:json', JSON.stringify(result));

	console.log('SERVICE ALL', JSON.stringify(result, null, 2));

	Logger.success(`Finished publishing Service Metrics (${globalTimer.get()})`);

	//
}
