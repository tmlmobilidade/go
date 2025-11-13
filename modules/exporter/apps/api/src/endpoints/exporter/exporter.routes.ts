/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors-fastify';

import { ExporterController } from './exporter.controller.js';

/* * */

const NAMESPACE = '/exporter';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		// GET /exporter
		instance.get('/', { preHandler: authorizationMiddleware() }, ExporterController.getAll);

		//
		// GET /exporter/:id/download
		instance.get('/:id/download', { preHandler: authorizationMiddleware() }, ExporterController.download);

		//
		// POST /exporter
		instance.post('/', { preHandler: authorizationMiddleware() }, ExporterController.create);

		next();
	},
	{ prefix: NAMESPACE },
);
