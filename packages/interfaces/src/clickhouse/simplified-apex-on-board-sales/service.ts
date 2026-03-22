/* * */

import { simplifiedApexOnBoardSalesSchema } from '@/clickhouse/simplified-apex-on-board-sales/schema.js';
import { ClickHouseTable } from '@tmlmobilidade/clickhouse';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/types';

/* * */

class SimplifiedApexOnBoardSalesNewClass extends ClickHouseTable<SimplifiedApexOnBoardSale> {
	//

	override databaseName = 'operation';
	override schema = simplifiedApexOnBoardSalesSchema;
	override tableName = 'simplified_apex_on-board-sales';

	public override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Simplified Apex On-Board Sales...');
	}

	//
}

/* * */

export const simplifiedApexOnBoardSalesNew = new SimplifiedApexOnBoardSalesNewClass();
