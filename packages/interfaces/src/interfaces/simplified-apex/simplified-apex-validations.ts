/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type SimplifiedApexValidation, type UpdateSimplifiedApexValidationDto } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';

/* * */

class SimplifiedApexValidationsClass extends MongoCollectionClass<SimplifiedApexValidation, SimplifiedApexValidation, UpdateSimplifiedApexValidationDto> {
	private static _instance: SimplifiedApexValidationsClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!SimplifiedApexValidationsClass._instance) {
			const instance = new SimplifiedApexValidationsClass();
			await instance.connect();
			SimplifiedApexValidationsClass._instance = instance;
		}
		return SimplifiedApexValidationsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { created_at: 1 } },
			{ background: true, key: { received_at: 1 } },
			{ background: true, key: { agency_id: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { trip_id: 1, created_at: 1 } },
			{ background: true, key: { agency_id: 1, created_at: 1 } },
			{ background: true, key: { card_serial_number: 1 } },
			{ background: true, key: { agency_id: 1, device_id: 1, mac_sam_serial_number: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { mac_sam_serial_number: 1, created_at: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'simplified_apex_validations';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const simplifiedApexValidations = asyncSingletonProxy(SimplifiedApexValidationsClass);
