/* * */

import { createExport } from '@/endpoints/exporter/controller/create-export.js';
import { downloadExport } from '@/endpoints/exporter/controller/download-export.js';
import { listExports } from '@/endpoints/exporter/controller/list-export.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

/* * */

const NAMESPACE = '/exporter';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware() },
			listExports,
		);

		instance.get(
			'/:id/download',
			{ preHandler: authorizationMiddleware() },
			downloadExport,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware() },
			createExport,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
