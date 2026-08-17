/* * */

import { fastifyWebsocket } from '@fastify/websocket';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

import { getLines } from './controllers/get-lines.js';
import { getRideById } from './controllers/get-ride-by-id.js';
import { getRides } from './controllers/get-rides.js';
import { getStops } from './controllers/get-stops.js';

/* * */

const NAMESPACE = '/operation';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	async (instance) => {
		//

		await instance.register(fastifyWebsocket);

		instance.get(
			'/rides/:id/ride',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			getRideById,
		);

		instance.post(
			'/rides',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			getRides,
		);

		instance.get(
			'/lines',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			getLines,
		);

		instance.get(
			'/stops',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			getStops,
		);

		//
	},
	{ prefix: NAMESPACE },
);
