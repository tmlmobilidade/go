/* * */

import { GtfsMergedController } from '@/endpoints/gtfs-merged/gtfs-merged.controller.js';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/gtfs-merged';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/test-1', GtfsMergedController.download);

		next();
	},
	{ prefix: NAMESPACE },
);
