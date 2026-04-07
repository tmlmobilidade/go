/* * */

import { StopsSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

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
			StopsSharedController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.create]) },
			StopsSharedController.getById,
		);

		instance.get(
			'/batch',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.create]) },
			StopsSharedController.getBatch,
		);
	},
	{ prefix: NAMESPACE },
);
