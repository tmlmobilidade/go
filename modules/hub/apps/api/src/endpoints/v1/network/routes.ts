/* * */

import { getLines } from '@/endpoints/v1/network/controllers/get-lines.js';
import { getPattern } from '@/endpoints/v1/network/controllers/get-pattern.js';
import { getRoutes } from '@/endpoints/v1/network/controllers/get-routes.js';
import { getShape } from '@/endpoints/v1/network/controllers/get-shape.js';
import { getStops } from '@/endpoints/v1/network/controllers/get-stops.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/network';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/stops', getStops);

		instance.get('/lines', getLines);

		instance.get('/routes', getRoutes);

		instance.get('/patterns/:id', getPattern);

		instance.get('/shapes/:id', getShape);

		next();
	},
	{ prefix: namespace },
);
