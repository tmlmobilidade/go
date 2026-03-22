/* * */

import { simplifiedApexValidationsSchema } from '@/clickhouse/simplified-apex-validations/schema.js';
import { ClickhouseTable } from '@tmlmobilidade/clickhouse';

/* * */

export class SimplifiedApexValidationsNew extends ClickhouseTable {
	//

	public static override DatabaseName = 'simplified_apex';
	public static override TableName = 'simplified_apex_validations';
	public static override TableSchema = simplifiedApexValidationsSchema;

	public override async init() {
		console.log('Initializing ClickHouse service for Simplified Apex Validations...');
		await this.createDatabase();
		await this.createTable(
			SimplifiedApexValidationsNew.DatabaseName,
			SimplifiedApexValidationsNew.TableName,
			SimplifiedApexValidationsNew.TableSchema,
			'_id',
			'ReplicatedMergeTree',
		);
	}

	//
}
