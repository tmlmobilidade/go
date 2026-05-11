/* * */

import { fastifyWebsocket } from '@fastify/websocket';
import { OperationalLinesSharedController, OperationalStopsSharedController, RidesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyInstance, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { type GetOperationalLinesBatchQuery, type GetOperationalStopsBatchQuery, type GetRidesBatchQuery, type OperationalLine, type OperationalStop, PermissionCatalog, type RideNormalized } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/operation';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	async (instance) => {
		//

		await instance.register(fastifyWebsocket);

		instance.get(
			'/rides',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<RideNormalized[]>) => RidesSharedController.getBatch(request, reply, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read),
		);

		instance.get(
			'/rides/ws',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]), websocket: true },
			(socket) => {
				RidesSharedController.websocket(socket);
			},
		);

		instance.get(
			'/rides/:id/ride',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			(request: FastifyRequest, reply: FastifyReply<RideNormalized>) => RidesSharedController.getRideById(request, reply, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read),
		);

		instance.get(
			'/lines',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetOperationalLinesBatchQuery }>, reply: FastifyReply<OperationalLine[]>) => OperationalLinesSharedController.getBatch(request, reply, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read),
		);

		instance.get(
			'/stops',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetOperationalStopsBatchQuery }>, reply: FastifyReply<OperationalStop[]>) => OperationalStopsSharedController.getBatch(request, reply, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read),
		);

		//
	},
	{ prefix: NAMESPACE },
);
