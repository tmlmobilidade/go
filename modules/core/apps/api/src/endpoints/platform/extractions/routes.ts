/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { createExtractionHandler } from './handlers/create-extraction.js';
import { deleteExtractionHandler } from './handlers/delete-extraction.js';
import { listExtractionsHandler } from './handlers/list-extractions.js';
import { lockExtractionHandler } from './handlers/lock-extraction.js';

/* * */

const NAMESPACE = '/platform/extractions';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/list', { preHandler: authorizationMiddleware() }, listExtractionsHandler);

		instance.post('/create', { preHandler: authorizationMiddleware() }, createExtractionHandler);

		instance.put('/lock/:id', { preHandler: authorizationMiddleware() }, lockExtractionHandler);

		instance.delete('/delete/:id', { preHandler: authorizationMiddleware() }, deleteExtractionHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
