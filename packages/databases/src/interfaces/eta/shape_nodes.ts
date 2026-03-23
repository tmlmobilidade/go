/* * */

import { ClickHouseColumn, GOClickHouseClient } from '@/index.js';
import { ClickHouseInterfaceTemplate } from '@/templates/clickhouse.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

interface ETAShapeNodes {
	latitude: number
	longitude: number
	node_index: number
	shape_id: string
}

const tableSchema: ClickHouseColumn<ETAShapeNodes>[] = [
	{ name: 'shape_id', type: 'String' },
	{ name: 'node_index', type: 'UInt32' },
	{ name: 'longitude', type: 'Float64' },
	{ name: 'latitude', type: 'Float64' },
];

/* * */

class ETAShapeNodesClass extends ClickHouseInterfaceTemplate<ETAShapeNodes> {
	//

	private static _instance: null | Promise<ETAShapeNodesClass> = null;

	public override readonly databaseName = 'eta';
	public override readonly schema = tableSchema;
	public override readonly tableName = 'shape_nodes';

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new ETAShapeNodesClass();
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

	/**
	 * Clears all data from the table.
	 * @returns A promise that resolves when the data is cleared.
	 */
	public async clearData(): Promise<void> {
		const client = await this.getClient();

		await client.command({
			query: `TRUNCATE TABLE "${this.databaseName}"."${this.tableName}"`,
		});
	}

	protected override connectToClient() {
		return GOClickHouseClient.getClient();
	}

	protected override async postInit(): Promise<void> {
		console.log('Post init ClickHouse service for Simplified Vehicle Events...');
	}

	//
}

/* * */

export const etaShapeNodes = asyncSingletonProxy(ETAShapeNodesClass);
