/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

/* * */

export async function getStopAliases(agencyId: string): Promise<Map<string, Stop>> {
	const stops = await goDb.infrastructure.stops.findMany({ 'flags.agency_ids': agencyId, 'is_deleted': false });
	const aliases = new Map<string, Stop>();

	for (const stop of stops) {
		aliases.set(stop._id, stop);
		for (const flag of stop.flags) {
			if (flag.agency_ids.includes(agencyId)) aliases.set(flag.stop_id, stop);
		}
		for (const legacyId of stop.legacy_ids) aliases.set(legacyId, stop);
	}

	return aliases;
}
