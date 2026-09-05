/* * */

import { getLinesHandler } from '@/endpoints/v1/network/handlers/get-lines.js';
import { getPatternHandler } from '@/endpoints/v1/network/handlers/get-pattern.js';
import { getRoutesHandler } from '@/endpoints/v1/network/handlers/get-routes.js';
import { getStopsHandler } from '@/endpoints/v1/network/handlers/get-stops.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/go-clients-fastify';

/* * */

const namespace = '/v1/network';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/stops', getStopsHandler);

		instance.get('/lines', getLinesHandler);

		instance.get('/routes', getRoutesHandler);

		instance.get('/patterns/:id', getPatternHandler);

		next();
	},
	{ prefix: namespace },
);
