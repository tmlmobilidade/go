/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type SimplifiedAgency, SimplifiedAgencySchema } from '@tmlmobilidade/go-types-core';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Syncs the LabDB table with the GoDB collection.
 */
export async function syncLabdbAgenciesTask() {
	//

	const timer = new Timer();

	//
	// Drop the table

	Logger.info('Dropping table core.simplified_agencies');

	await labDb.queryFromString(`DROP TABLE IF EXISTS core.simplified_agencies`);

	Logger.success('Dropped table core.simplified_agencies');

	//
	// Recreate the table

	Logger.info('Recreating table core.simplified_agencies');

	await labDb.core.simplifiedAgencies.init();

	Logger.success('Recreated table core.simplified_agencies');

	//
	// Setup a batch writer instance

	const writer = new BatchWriter<SimplifiedAgency>({
		batch_size: 5_000,
		insertFn: async (data) => {
			await labDb.core.simplifiedAgencies.insert('JSONEachRow', data);
		},
		title: await labDb.core.simplifiedAgencies.getTableName(),
	});

	//
	// Copy the data from the GoDB collection to the LabDB table

	Logger.info('Copying data from GoDB collection to LabDB table');

	const foundAgencies = await goDb.core.agencies.findMany();

	for (const agencyData of foundAgencies) {
		//

		const simplifiedAgencyItem: SimplifiedAgency = {
			_id: agencyData._id,
			code: agencyData.code,
			created_at: agencyData.created_at,
			name: agencyData.name,
			primary_language: agencyData.primary_language,
			pta_name: agencyData.pta_name,
			short_name: agencyData.short_name,
			timezone: agencyData.timezone,
			updated_at: agencyData.updated_at,
		};

		const parsedItem = SimplifiedAgencySchema.parse(simplifiedAgencyItem);

		await writer.write(parsedItem);
	}

	await writer.flush();

	Logger.info({ message: `LabDB synced in ${timer.get()}` });
}
