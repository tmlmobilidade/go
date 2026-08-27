/* * */

import { listAgenciesHandler } from '@/endpoints/schools/handlers/list-agencies.js';
import { SchoolsController } from '@/endpoints/schools/schools.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

const NAMESPACE = '/schools';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.schools.scope, [PermissionCatalog.all.schools.actions.read]) },
			SchoolsController.getAll,
		);

		instance.post(
			'/list-agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.schools.scope, [PermissionCatalog.all.schools.actions.read, PermissionCatalog.all.schools.actions.create]) },
			listAgenciesHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.schools.scope, [PermissionCatalog.all.schools.actions.read]) },
			SchoolsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.schools.scope, [PermissionCatalog.all.schools.actions.create]) },
			SchoolsController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.schools.scope, [PermissionCatalog.all.schools.actions.update]) },
			SchoolsController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.schools.scope, [PermissionCatalog.all.schools.actions.lock]) },
			SchoolsController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.schools.scope, [PermissionCatalog.all.schools.actions.delete]) },
			SchoolsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
