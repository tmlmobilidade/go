/* * */

import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';

import { FileExporterController } from './file-exporter.controller.js';

/* * */

const NAMESPACE = '/file-exporter';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		// GET /file-exporter
		instance.get('/', { preHandler: authorizationMiddleware() }, FileExporterController.getAll);

		// POST /file-exporter
		instance.post('/', { preHandler: authorizationMiddleware() }, FileExporterController.create);

		next();
	},
	{ prefix: NAMESPACE },
);
