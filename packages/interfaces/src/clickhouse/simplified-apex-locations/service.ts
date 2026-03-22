/* * */

import { simplifiedApexLocationsSchema } from '@/clickhouse/simplified-apex-locations/schema.js';
import { ClickHouseTable } from '@tmlmobilidade/clickhouse';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';

/* * */

class SimplifiedApexLocationsNewClass extends ClickHouseTable<SimplifiedApexValidation> {
	//

	override databaseName = 'operation';
	override schema = simplifiedApexLocationsSchema;
	override tableName = 'simplified_apex_locations';

	public override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Simplified Apex Locations...');
	}

	//
}

/* * */

export const simplifiedApexLocationsNew = new SimplifiedApexLocationsNewClass();
