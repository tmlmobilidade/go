import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/** Record completion after successful cache writes, without breaking publication
 * if optional observability storage is temporarily unavailable. */
export async function recordPublication(agencyId: string, format: 'gtfs' | 'simplified'): Promise<void> {
	try {
		await labDb.insert({
			format: 'JSONEachRow',
			table: 'eta.publication_runs',
			values: [{ agency_id: agencyId, format, published_at: Date.now() }],
		});
	}
	catch (error) {
		Logger.error({ message: `Could not record ETA publication: ${String(error)}` });
	}
}
