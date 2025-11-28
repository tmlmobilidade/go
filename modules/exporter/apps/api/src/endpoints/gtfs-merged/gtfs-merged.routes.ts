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

		instance.get('/test-1', GtfsMergedController.download1);

		instance.get('/test-2', GtfsMergedController.download2);

		instance.get('/test-3', GtfsMergedController.download2);

		next();
	},
	{ prefix: NAMESPACE },
);
