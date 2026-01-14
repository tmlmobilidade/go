/* * */

import { RidesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyInstance, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { type GetRidesBatchQuery, PermissionCatalog, type RideNormalized } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/rides';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<RideNormalized[]>) => RidesSharedController.getBatch(request, reply, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read),
		);

		instance.get(
			'/:id/ride',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			(request: FastifyRequest, reply: FastifyReply<RideNormalized>) => RidesSharedController.getRideById(request, reply, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read),
		);

		next();
	},
	{ prefix: NAMESPACE },
);
