/* * */

import { type AgencyCacheSuffix, mergeGtfsFeeds, readAgencyCache } from '@/utils/agency-cache.js';
import { getOrganization } from '@/utils/organization.js';
import { type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';

/** Keep the agency associated with each available feed when a cache key is missing. */
export async function readOrganizationGtfs(request: FastifyRequest, suffix: AgencyCacheSuffix) {
	const { agency_ids: agencyIds } = getOrganization(request);
	const entries = await Promise.all([...new Set(agencyIds)].map(async agencyId => ({
		agencyId,
		feeds: await readAgencyCache<GtfsRtFeedMessage>([agencyId], suffix),
	})));
	const available = entries.filter(entry => entry.feeds.length);
	return mergeGtfsFeeds(available.map(entry => entry.feeds[0].data), available.map(entry => entry.agencyId));
}
