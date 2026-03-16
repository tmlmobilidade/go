/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type SimplifiedApexOnBoardRefund, type UpdateSimplifiedApexOnBoardRefundDto } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';

/* * */

class SimplifiedApexOnBoardRefundsClass extends MongoCollectionClass<SimplifiedApexOnBoardRefund, SimplifiedApexOnBoardRefund, UpdateSimplifiedApexOnBoardRefundDto> {
	private static _instance: SimplifiedApexOnBoardRefundsClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!SimplifiedApexOnBoardRefundsClass._instance) {
			const instance = new SimplifiedApexOnBoardRefundsClass();
			await instance.connect();
			SimplifiedApexOnBoardRefundsClass._instance = instance;
		}
		return SimplifiedApexOnBoardRefundsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { created_at: 1 } },
			{ background: true, key: { received_at: 1 } },
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
		return 'simplified_apex_on_board_refunds';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const simplifiedApexOnBoardRefunds = asyncSingletonProxy(SimplifiedApexOnBoardRefundsClass);
