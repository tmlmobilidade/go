/* * */

import { readOrganizationGtfs } from '@/utils/organization-gtfs.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { encodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';

/** Return the merged organization GTFS-RT feed. */
export async function getEtaGtfsRtProtobufHandler(request: FastifyRequest, reply: FastifyReply<Buffer>) {
	//

	//
	// Retrieve the published data

	const feed = await readOrganizationGtfs(request, 'realtime:eta:all:gtfs');
	return reply.header('cache-control', 'public, max-age=3').type('application/octet-stream').send(Buffer.from(await encodeGtfsRtFeed(feed)));
}
