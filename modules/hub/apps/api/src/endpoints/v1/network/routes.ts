/* * */

import { getLegacyStopsMap } from '@/endpoints/v1/network/get-legacy-stops-map.js';
import { getLines } from '@/endpoints/v1/network/get-lines.js';
import { getPattern } from '@/endpoints/v1/network/get-pattern.js';
import { getRoutes } from '@/endpoints/v1/network/get-routes.js';
import { getShape } from '@/endpoints/v1/network/get-shape.js';
import { getStops } from '@/endpoints/v1/network/get-stops.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/network';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/stops', getStops);

		instance.get('/legacy-stops-map', getLegacyStopsMap);

		instance.get('/lines', getLines);

		instance.get('/routes', getRoutes);

		instance.get('/patterns/:id', getPattern);

		instance.get('/shapes/:id', getShape);

		next();
	},
	{ prefix: namespace },
);
