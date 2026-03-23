/* * */

import { GOClickHouseClient } from '@/clients/go-clickhouse.js';
import { simplifiedApexValidationsSchema } from '@/interfaces/simplified-apex-validations/schema.js';
import { GOClickHouseTemplate } from '@/templates/go-clickhouse-template.js';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';

/* * */

class SimplifiedApexValidationsNewClass extends GOClickHouseTemplate<SimplifiedApexValidation> {
	//

	private static _instance: null | Promise<SimplifiedApexValidationsNewClass> = null;

	public override readonly databaseName = 'operation';
	public override readonly schema = simplifiedApexValidationsSchema;
	public override readonly tableName = 'simplified_apex_validations';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new SimplifiedApexValidationsNewClass();
				// This behaves like the constructor,
				// but allows for async initialization.
				await instance.init();
				return instance;
			})();
		}
		// Await the instance if it's still initializing,
		// or return it immediately if ready.
		return await this._instance;
	}

	protected override connectToClient() {
		return GOClickHouseClient.getClient();
	}

	protected override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Simplified Apex Validations...');
	}

	//
}

/* * */

export const simplifiedApexValidationsNew = await SimplifiedApexValidationsNewClass.getInstance();
