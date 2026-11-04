import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { randomUUID } from 'node:crypto';

import { publish } from './publish.js';

/** The only direct goDb read in Performance: copy reference data, never calculate metrics. */
export async function loadAgencies() {
	const referenceAt = Date.now();
	const runId = randomUUID();
	const agencies = await goDb.core.agencies.findMany();
	if (!agencies.length) throw new Error('Agency reference data unavailable');
	const values = agencies.map(agency => ({
		agency_code: String(agency.code ?? ''),
		agency_id: agency._id,
		price_per_km: Number(agency.financials?.price_per_km ?? 0),
		run_id: runId,
	}));
	if (values.some(agency => !agency.agency_id || !Number.isFinite(agency.price_per_km))) {
		throw new Error('Invalid agency reference data');
	}
	await labDb.insert({ clickhouse_settings: { async_insert: 0 }, format: 'JSONEachRow', table: 'temp_performance.agencies', values });
	await publish('__agencies', runId, '1970-01-01', '1970-01-01', referenceAt);
}
