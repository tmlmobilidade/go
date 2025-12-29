/* * */

import { AnnotationsController } from '@/endpoints/annotations/annotations.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/annotations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.read]) },
			AnnotationsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.read]) },
			AnnotationsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.create]) },
			AnnotationsController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.update]) },
			AnnotationsController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.lock]) },
			AnnotationsController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.delete]) },
			AnnotationsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
