/* * */

import { FaresController } from '@/endpoints/fares/fares.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/fares';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.fares.actions.nav], scope: PermissionCatalog.all.fares.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			FaresController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.fares.actions.nav], scope: PermissionCatalog.all.fares.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			FaresController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.create]) },
			FaresController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.update]) },
			FaresController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.lock]) },
			FaresController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.delete]) },
			FaresController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
