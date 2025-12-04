/* * */

import { ProposedChangesController } from '@/endpoints/proposed-changes/proposed-changes.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/proposed-changes';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			ProposedChangesController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			ProposedChangesController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			ProposedChangesController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			ProposedChangesController.update,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			ProposedChangesController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
