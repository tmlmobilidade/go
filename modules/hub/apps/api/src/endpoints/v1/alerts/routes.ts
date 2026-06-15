/* * */

import { getGtfsRtJsonFeedCm } from '@/endpoints/v1/alerts/get-gtfs-rt-json-feed-cm.js';
import { getGtfsRtJsonFeed } from '@/endpoints/v1/alerts/get-gtfs-rt-json-feed.js';
import { getGtfsRtProtobufFeed } from '@/endpoints/v1/alerts/get-gtfs-rt-protobuf-feed.js';
import { getJsonFeed } from '@/endpoints/v1/alerts/get-json-feed.js';
import { getRssFeed } from '@/endpoints/v1/alerts/get-rss-feed.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/alerts';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', getJsonFeed);

		instance.get('/gtfs', getGtfsRtJsonFeed);

		instance.get('/gtfs-cm', getGtfsRtJsonFeedCm);

		instance.get('/gtfs.pb', getGtfsRtProtobufFeed);

		instance.get('.rss', getRssFeed);

		next();
	},
	{ prefix: namespace },
);
