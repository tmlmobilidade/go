/* * */

import { simplifiedApexOnBoardRefundsSchema } from '@/clickhouse/simplified-apex-on-board-refunds/schema.js';
import { ClickHouseTable } from '@tmlmobilidade/clickhouse';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/types';

/* * */

class SimplifiedApexOnBoardRefundsNewClass extends ClickHouseTable<SimplifiedApexOnBoardRefund> {
	//

	override databaseName = 'simplified_apex';
	override schema = simplifiedApexOnBoardRefundsSchema;
	override tableName = 'simplified_apex_on-board-refunds';

	public override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Simplified Apex On-Board Refunds...');
	}

	//
}

/* * */

export const simplifiedApexOnBoardRefundsNew = new SimplifiedApexOnBoardRefundsNewClass();
