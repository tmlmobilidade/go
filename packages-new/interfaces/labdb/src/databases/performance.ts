/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { demandByAgencyByOperationalDateSchema } from '@/types/performance.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';

/* * */

export class PerformanceDatabase {
	//

	//
	// Tables
	public readonly demandByAgencyByOperationalDate: ClickHouseInterfaceTemplate<DemandByAgencyByOperationalDate>;

	//
	private readonly databaseName = 'performance';

	public constructor(instance: ClickHouseClient) {
		//

		// Create the table interfaces
		this.demandByAgencyByOperationalDate = new ClickHouseInterfaceTemplate<DemandByAgencyByOperationalDate>(instance, this.databaseName, 'demand_by_agency_by_operational_date', demandByAgencyByOperationalDateSchema, {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['operational_date', 'agency_id'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
	}
}
