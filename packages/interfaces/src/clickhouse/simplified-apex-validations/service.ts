/* * */

import { simplifiedApexValidationsSchema } from '@/clickhouse/simplified-apex-validations/schema.js';
import { ClickHouseTable } from '@tmlmobilidade/clickhouse';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';

/* * */

class SimplifiedApexValidationsNewClass extends ClickHouseTable<SimplifiedApexValidation> {
	//

	override databaseName = 'operation';
	override schema = simplifiedApexValidationsSchema;
	override tableName = 'simplified_apex_validations';

	public override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Simplified Apex Validations...');
	}

	//
}

/* * */

export const simplifiedApexValidationsNew = new SimplifiedApexValidationsNewClass();
