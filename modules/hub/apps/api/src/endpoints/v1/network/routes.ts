/* * */

import { resolveOrganization } from '@/utils/organization.js';
import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getLineHandler } from './handlers/get-line.js';
import { getLinesHandler } from './handlers/get-lines.js';
import { getPatternHandler } from './handlers/get-pattern.js';
import { getRouteHandler } from './handlers/get-route.js';
import { getRoutesHandler } from './handlers/get-routes.js';
import { getShapeHandler } from './handlers/get-shape.js';
import { getStopHandler } from './handlers/get-stop.js';
import { getStopsHandler } from './handlers/get-stops.js';

/* * */

const NAMESPACE = '/v1/:organizationId/network';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.addHook('preHandler', resolveOrganization);

		instance.get('/stops', getStopsHandler);

		instance.get('/stops/:stopId', getStopHandler);

		instance.get('/lines', getLinesHandler);

		instance.get('/lines/:lineId', getLineHandler);

		instance.get('/routes', getRoutesHandler);

		instance.get('/routes/:routeId', getRouteHandler);

		instance.get('/patterns/:patternId', getPatternHandler);

		instance.get('/shapes/:shapeId', getShapeHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
