/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { demandByAgencyByOperationalDateTableSchema } from '@/schemas/performance.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';

/* * */

export class PerformanceDatabase {
	//

	public readonly demandByAgencyByOperationalDate: ClickHouseInterfaceTemplate<DemandByAgencyByOperationalDate>;

	private readonly databaseName = 'performance';

	public constructor(instance: ClickHouseClient) {
		this.demandByAgencyByOperationalDate = new ClickHouseInterfaceTemplate<DemandByAgencyByOperationalDate>(instance, this.databaseName, 'demand_by_agency_by_operational_date', demandByAgencyByOperationalDateTableSchema, {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['operational_date', 'agency_id'],
			partitionBy: 'intDiv(operational_date, 100)',
		});
	}

	public async init() {
		await this.demandByAgencyByOperationalDate.init();
	}
}
