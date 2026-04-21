/* * */

import { fastifyWebsocket } from '@fastify/websocket';
import { LinesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyInstance, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { type GetRidesBatchQuery, type HashedTrip, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/lines';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	async (instance) => {
		//

		await instance.register(fastifyWebsocket);

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<HashedTrip[]>) => LinesSharedController.getBatch(request, reply, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read),
		);

		//
	},
	{ prefix: NAMESPACE },
);
