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
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.read_annotations]) },
			AnnotationsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.read_annotations]) },
			AnnotationsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.create_annotations]) },
			AnnotationsController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.update_annotations]) },
			AnnotationsController.update,
		);

		instance.get(
			'/:id/toggle-lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.lock_annotations]) },
			AnnotationsController.toggleLockById,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.delete_annotations]) },
			AnnotationsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
