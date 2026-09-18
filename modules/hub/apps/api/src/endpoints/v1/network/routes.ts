/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getLineHandler } from './handlers/get-line.js';
import { getLinesHandler } from './handlers/get-lines.js';
import { getPatternHandler } from './handlers/get-pattern.js';
import { getRouteHandler } from './handlers/get-route.js';
import { getRoutesHandler } from './handlers/get-routes.js';
import { getStopHandler } from './handlers/get-stop.js';
import { getStopsHandler } from './handlers/get-stops.js';

/* * */

const NAMESPACE = '/v1/network';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/stops', getStopsHandler);

		instance.get('/stops/:id', getStopHandler);

		instance.get('/lines', getLinesHandler);

		instance.get('/lines/:id', getLineHandler);

		instance.get('/routes', getRoutesHandler);

		instance.get('/routes/:id', getRouteHandler);

		instance.get('/patterns/:id', getPatternHandler);

		instance.get('/shapes/:id', getShapeHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
