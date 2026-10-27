import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getPublishedReleaseHandler } from './handlers/get-published-release.js';
import { listPublishedReleasesHandler } from './handlers/list-published-releases.js';
import { markReleasesSeenHandler } from './handlers/mark-releases-seen.js';

/* * */

const NAMESPACE = '/platform/changelog';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', { preHandler: authorizationMiddleware() }, listPublishedReleasesHandler);

		instance.get('/:id', { preHandler: authorizationMiddleware() }, getPublishedReleaseHandler);

		instance.post('/seen', { preHandler: authorizationMiddleware() }, markReleasesSeenHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
