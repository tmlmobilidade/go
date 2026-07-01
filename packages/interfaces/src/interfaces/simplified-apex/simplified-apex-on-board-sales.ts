/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';

/* * */

class SimplifiedApexOnBoardSalesClass extends MongoCollectionClass<SimplifiedApexOnBoardSale, SimplifiedApexOnBoardSale, SimplifiedApexOnBoardSale> {
	private static _instance: SimplifiedApexOnBoardSalesClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!SimplifiedApexOnBoardSalesClass._instance) {
			const instance = new SimplifiedApexOnBoardSalesClass();
			await instance.connect();
			SimplifiedApexOnBoardSalesClass._instance = instance;
		}
		return SimplifiedApexOnBoardSalesClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { created_at: 1 } },
			{ background: true, key: { received_at: 1 } },
			{ background: true, key: { card_serial_number: 1 } },
			{ background: true, key: { agency_id: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { trip_id: 1, created_at: 1 } },
			{ background: true, key: { agency_id: 1, created_at: 1 } },
			{ background: true, key: { validation_id: 1 } },
			{ background: true, key: { agency_id: 1, device_id: 1, mac_sam_serial_number: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { mac_sam_serial_number: 1, created_at: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'simplified_apex_on_board_sales';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const simplifiedApexOnBoardSales = asyncSingletonProxy(SimplifiedApexOnBoardSalesClass);
