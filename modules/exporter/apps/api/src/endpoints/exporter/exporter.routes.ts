/* * */

import { ExporterController } from '@/endpoints/exporter/exporter.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/exporter';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware() },
			ExporterController.getAll,
		);

		instance.get(
			'/:id/download',
			{ preHandler: authorizationMiddleware() },
			ExporterController.download,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware() },
			ExporterController.create,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
