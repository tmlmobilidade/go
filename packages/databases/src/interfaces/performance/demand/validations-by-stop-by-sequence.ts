/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { type ClickHouseTableEngine, type ClickHouseTableSchema } from '@/types/index.js';
import { type ValidationsByStopBySequence } from '@tmlmobilidade/go-types-performance';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

const tableSchema: ClickHouseTableSchema<ValidationsByStopBySequence> = {
	pattern_id: { type: 'String' },
	stop_id: { type: 'String' },
	stop_sequence: { type: 'UInt64' },
	trip_id: { type: 'String' },
	validations: { type: 'UInt64' },
};

/* * */

class ValidationsByStopBySequenceClass extends ClickHouseInterfaceTemplate<ValidationsByStopBySequence> {
	//

	private static _instance: null | Promise<ValidationsByStopBySequenceClass> = null;

	protected override readonly databaseName = 'performance';
	protected override readonly engine: ClickHouseTableEngine<ValidationsByStopBySequence> = 'ReplacingMergeTree()';
	protected override readonly manageSchema = false;
	protected override readonly orderBy = 'pattern_id, trip_id, stop_id, stop_sequence';
	protected override readonly schema = tableSchema;
	protected override readonly tableName = 'validations_by_stop_by_sequence';

	public static async getInstance() {
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ValidationsByStopBySequenceClass();
				await instance.init();
				return instance;
			})();
		}
		return await this._instance;
	}

	protected override connectToClient() {
		return GOClickHouseClient.getClient();
	}
}

/* * */

export const validationsByStopBySequence = asyncSingletonProxy(ValidationsByStopBySequenceClass);
