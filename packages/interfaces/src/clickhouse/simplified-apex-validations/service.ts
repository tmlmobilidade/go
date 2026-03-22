/* * */

import { simplifiedApexValidationsSchema } from '@/clickhouse/simplified-apex-validations/schema.js';
import { ClickHouseTable } from '@tmlmobilidade/clickhouse';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';

/* * */

export class SimplifiedApexValidationsNew extends ClickHouseTable<SimplifiedApexValidation> {
	//

	override databaseName = 'simplified_apex';
	override schema = simplifiedApexValidationsSchema;
	override tableName = 'simplified_apex_validations';

	public override async postInit(): Promise<void> {
		console.log('Initializing ClickHouse service for Simplified Apex Validations...');
	}

	//
}
