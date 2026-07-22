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
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.zones.actions.nav], scope: PermissionCatalog.all.zones.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			ZonesController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.zones.actions.nav], scope: PermissionCatalog.all.zones.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
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
