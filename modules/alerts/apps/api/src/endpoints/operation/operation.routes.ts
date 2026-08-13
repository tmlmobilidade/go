/* * */

import { fastifyWebsocket } from '@fastify/websocket';
import { authorizationMiddleware, FastifyInstance, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

import { getRideById } from './controllers/get-ride-by-id.js';
import { getRides } from './controllers/get-rides.js';

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

		// instance.get(
		// 	'/lines',
		// 	{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
		// 	(request: FastifyRequest<{ Querystring: GetOperationalLinesBatchQuery }>, reply: FastifyReply<OperationalLine[]>) => OperationalLinesSharedController.getBatch(request, reply, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read),
		// );

		// instance.get(
		// 	'/stops',
		// 	{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
		// 	(request: FastifyRequest<{ Querystring: GetOperationalStopsBatchQuery }>, reply: FastifyReply<OperationalStop[]>) => OperationalStopsSharedController.getBatch(request, reply, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read),
		// );

		//
	},
	{ prefix: NAMESPACE },
);
