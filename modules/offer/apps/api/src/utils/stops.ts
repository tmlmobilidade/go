import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { Stop } from '@tmlmobilidade/types';

export function createImportedStopResolver(agencyId?: string) {
	const cache = new Map<string, Promise<null | Stop>>();

	return async (rawStopId: string): Promise<null | Stop> => {
		const normalizedStopId = rawStopId.trim();
		const cacheKey = `${agencyId ?? 'no-agency'}::${normalizedStopId}`;

		const cached = cache.get(cacheKey);
		if (cached) return cached;

		const promise = (async () => {
			const numericStopId = Number(normalizedStopId);
			if (!Number.isNaN(numericStopId)) {
				const stopById = await goDB.infrastructure.stops.findById(numericStopId);
				if (stopById) return stopById;
			}

			if (agencyId) {
				const stopByAgencyFlag = await goDB.infrastructure.stops.findOne({
					flags: {
						$elemMatch: {
							agency_ids: agencyId,
							stop_id: normalizedStopId,
						},
					},
				});
				if (stopByAgencyFlag) return stopByAgencyFlag;
			}

			const stopByLegacyId = await goDB.infrastructure.stops.findOne({ legacy_id: normalizedStopId });
			if (stopByLegacyId) return stopByLegacyId;

			return null;
		})();

		cache.set(cacheKey, promise);
		return promise;
	};
}
