/* * */

import { ZonesController } from '@/endpoints/zones/zones.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/zones';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.read]) },
			ZonesController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.read]) },
			ZonesController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.create]) },
			ZonesController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.update]) },
			ZonesController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.lock]) },
			ZonesController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.delete]) },
			ZonesController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
