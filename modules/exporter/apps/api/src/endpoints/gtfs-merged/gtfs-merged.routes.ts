/* * */

import { ExporterController } from '@/endpoints/exporter/exporter.controller.js';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/gtfs-merged';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', ExporterController.download);

		next();
	},
	{ prefix: NAMESPACE },
);
