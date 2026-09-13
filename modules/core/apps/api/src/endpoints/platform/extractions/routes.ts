/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { createExtractionHandler } from './handlers/create-extraction.js';
import { listExtractionsHandler } from './handlers/list-extractions.js';

/* * */

const NAMESPACE = '/platform/extractions';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/list', { preHandler: authorizationMiddleware() }, listExtractionsHandler);

		instance.post('/create', { preHandler: authorizationMiddleware() }, createExtractionHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
