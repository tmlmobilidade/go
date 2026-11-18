/* * */

import { readOrganizationGtfs } from '@/utils/organization-gtfs.js';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';

/** Return the merged organization GTFS-RT feed. */
export async function getVehiclePositionsGtfsRtJsonHandler(request: FastifyRequest, reply: FastifyReply<GtfsRtFeedMessage>) {
	//

	//
	// Retrieve the published data

	const feed = await readOrganizationGtfs(request, 'realtime:vehicles:positions:gtfs');
	return sendSuccessApiResponse(reply, feed, { max_age: '3s' });
}
