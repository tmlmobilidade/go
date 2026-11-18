/* * */

import { getOrganization } from '@/utils/organization.js';
import { mergeRssFeeds } from '@/utils/rss.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';

/** Return agency RSS entries under this organization's channel. */
export async function getRssFeedHandler(request: FastifyRequest, reply: FastifyReply<string>) {
	//

	//
	// Retrieve the published data

	const organization = getOrganization(request);
	const feeds = await Promise.all([...new Set(organization.agency_ids)].map(agencyId => cacheDb.get(`hub:v1:${agencyId}:alerts:published:rss`)));
	const feed = mergeRssFeeds(feeds.filter(feed => feed !== null), {
		copyright: organization.long_name,
		description: organization.long_name,
		feedSelfUrl: `${request.protocol}://${request.headers.host}${request.url}`,
		link: `${request.protocol}://${request.headers.host}/v1/${encodeURIComponent(organization._id)}/alerts`,
		title: `${organization.short_name} - Alertas`,
	});
	return reply.header('cache-control', 'public, max-age=30').type('application/rss+xml; charset=utf-8').send(feed);
}
