/* * */

import { BRIDGEDB } from '@/BRIDGEDB.js';
import { type FlatRide, sampleRide } from '@/types.js';

/* * */

function detectType(value): string {
	if (typeof value === 'number') return 'numeric';
	if (typeof value === 'boolean') return 'boolean';
	return 'text';
}

/* * */

export async function dropExistingTable() {
	const dropTableQuery = `DROP TABLE IF EXISTS rides;`;
	await BRIDGEDB.client.query(dropTableQuery);
}

/* * */

export async function createTableFromExample(rideDataParsed) {
	const createTableQuery = `
		CREATE TABLE IF NOT EXISTS rides (
			${Object.entries(rideDataParsed)
				.map(([key]) => `"${key}" ${detectType(rideDataParsed[key])}`)
				.join(',')}
		);
	`;
	await BRIDGEDB.client.query(createTableQuery);
	const createIndexQuery = `
		CREATE UNIQUE INDEX IF NOT EXISTS _id_idx ON rides ("_id");
	`;
	await BRIDGEDB.client.query(createIndexQuery);
}

/* * */

export async function insertBatch(batch: FlatRide[]) {
	if (batch.length === 0) return;

	const keys = Object.keys(sampleRide);

	const placeholders = batch
		.map((_, i) => `(${keys.map((_, j) => `$${i * keys.length + j + 1}`).join(',')})`)
		.join(', ');

	const values = batch.flatMap(obj => keys.map(k => obj[k] ?? null));

	const query = `
        INSERT INTO rides (${keys.map(k => `"${k}"`).join(', ')})
        VALUES ${placeholders}
        ON CONFLICT (_id) DO UPDATE SET ${keys.map(k => `"${k}" = EXCLUDED."${k}"`).join(', ')};
    `;

	await BRIDGEDB.client.query(query, values);
}
