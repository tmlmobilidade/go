import { stops } from '@tmlmobilidade/interfaces';

export async function getStopByLegacyId(legacyId: string, cache: Map<string, { _id: string, name: string }>) {
	const cached = cache.get(legacyId);
	if (cached) return cached;
	const stop = await stops.findOne({ legacy_id: legacyId });
	if (!stop) return null;
	const entry = { _id: String(stop._id), name: stop.name };
	cache.set(legacyId, entry);
	return entry;
}
