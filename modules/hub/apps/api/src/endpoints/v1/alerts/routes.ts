/* * */

import { requireOrganization } from '@/hooks/require-organization.js';
import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getGtfsRtJsonFeedHandler } from './handlers/get-gtfs-rt-json-feed.js';
import { getGtfsRtProtobufFeedHandler } from './handlers/get-gtfs-rt-protobuf-feed.js';
import { getJsonFeedHandler } from './handlers/get-json-feed.js';
import { getRssFeedHandler } from './handlers/get-rss-feed.js';

/* * */

const NAMESPACE = '/v1/:organizationId/alerts';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.addHook('preHandler', requireOrganization);

		//

		instance.get('/', getJsonFeedHandler);

		instance.get('/gtfs', getGtfsRtJsonFeedHandler);

		instance.get('/gtfs.pb', getGtfsRtProtobufFeedHandler);

		instance.get('.rss', getRssFeedHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
