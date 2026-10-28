/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { simplifiedAgenciesTableSchema } from '@/schemas/core.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedAgency } from '@tmlmobilidade/go-types-core';

/* * */

export class CoreDatabase {
	//

	public readonly simplifiedAgencies: ClickHouseInterfaceTemplate<SimplifiedAgency>;

	private readonly databaseName = 'core';

	public constructor(client: ClickHouseClient) {
		//

		this.simplifiedAgencies = new ClickHouseInterfaceTemplate<SimplifiedAgency>(client, this.databaseName, 'simplified_agencies', simplifiedAgenciesTableSchema, {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['_id'],
		});
	}

	public async init() {
		await Promise.all([
			this.simplifiedAgencies.init(),
		]);
	}
}
