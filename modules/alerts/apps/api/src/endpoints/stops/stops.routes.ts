/* * */

import { StopsSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyInstance, FastifyReply, FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog, type Stop } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/stops';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	async (instance) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.create]) },
			(request: FastifyRequest, reply: FastifyReply<Stop[]>) => StopsSharedController.getAll(request, reply),
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.create]) },
			(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<null | Stop>) => StopsSharedController.getById(request, reply),
		);

		instance.get(
			'/batch',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.create]) },
			(request: FastifyRequest, reply: FastifyReply<{ label: string, value: string }[]>) => StopsSharedController.getBatch(request, reply),
		);
	},
	{ prefix: NAMESPACE },
);
