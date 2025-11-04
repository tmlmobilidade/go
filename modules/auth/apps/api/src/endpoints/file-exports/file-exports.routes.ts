/* * */

import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';

import { FileExporterController } from './file-exports.controller.js';

/* * */

const NAMESPACE = '/file-exports';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		// GET /file-exporter
		instance.get('/', { preHandler: authorizationMiddleware() }, FileExporterController.getAll);

		//
		// GET /file-exporter/:id/download
		instance.get('/:id/download', { preHandler: authorizationMiddleware() }, FileExporterController.download);

		//
		// POST /file-exporter
		instance.post('/', { preHandler: authorizationMiddleware() }, FileExporterController.create);

		next();
	},
	{ prefix: NAMESPACE },
);
