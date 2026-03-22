/* * */

import { simplifiedApexValidationsSchema } from '@/clickhouse/simplified-apex-validations/schema.js';
import { ClickhouseService } from '@tmlmobilidade/clickhouse';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

export class SimplifiedApexValidationsNewClass extends ClickhouseService {
	//

	public static DatabaseName = 'simplified_apex';
	public static TableName = 'simplified_apex_validations';
	public static TableSchema = simplifiedApexValidationsSchema;

	override async init() {
		await this.createDatabase(SimplifiedApexValidationsNewClass.DatabaseName);
		await this.createTable(
			SimplifiedApexValidationsNewClass.DatabaseName,
			SimplifiedApexValidationsNewClass.TableName,
			SimplifiedApexValidationsNewClass.TableSchema,
			'_id',
			'ReplicatedMergeTree',
		);
	}

	//
}

/* * */

export const simplifiedApexValidationsNew = asyncSingletonProxy(SimplifiedApexValidationsNewClass);
