/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { simplifiedStopsTableSchema } from '@/schemas/infrastructure.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedStop } from '@tmlmobilidade/go-types-infrastructure';

/* * */

export class InfrastructureDatabase {
	//

	public readonly simplifiedStops: ClickHouseInterfaceTemplate<SimplifiedStop>;

	private readonly databaseName = 'infrastructure';

	public constructor(client: ClickHouseClient) {
		//

		this.simplifiedStops = new ClickHouseInterfaceTemplate<SimplifiedStop>(client, this.databaseName, 'simplified_stops', simplifiedStopsTableSchema, {
			engine: 'ReplacingMergeTree(updated_at)',
			orderBy: ['_id'],
		});
	}

	public async init() {
		await Promise.all([
			this.simplifiedStops.init(),
		]);
	}
}
