/* * */

import { ClickHouseInterfaceTemplate } from '@/interface.template.js';
import { publicFeedbackTableSchema } from '@/schemas/hub.js';
import { ClickHouseClient } from '@tmlmobilidade/go-clients-clickhouse';
import { type PublicFeedback } from '@tmlmobilidade/go-types-public-info';

/* * */

export class HubDatabase {
	//

	public readonly feedback: ClickHouseInterfaceTemplate<PublicFeedback>;

	private readonly databaseName = 'hub';

	public constructor(client: ClickHouseClient) {
		this.feedback = new ClickHouseInterfaceTemplate<PublicFeedback>(client, this.databaseName, 'feedback', publicFeedbackTableSchema, {
			engine: 'MergeTree()',
			orderBy: ['created_at', 'entity_type', 'entity_id'],
			partitionBy: 'toYYYYMM(fromUnixTimestamp64Milli(toInt64(created_at)))',
		});
	}

	public async init() {
		await this.feedback.init();
	}
}
