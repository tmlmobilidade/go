/* * */

import { ProposedChangesController } from '@/endpoints/proposed-changes/proposed-changes.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const server = FastifyService.getInstance().server;
const namespace = '/proposed-changes';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /proposed-changes
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read) },
			ProposedChangesController.getAll,
		);

		// GET /proposed-changes/:id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read) },
			ProposedChangesController.getById,
		);

		// POST /proposed-changes
		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read) },
			ProposedChangesController.create,
		);

		// PUT /proposed-changes/:id
		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read) },
			ProposedChangesController.update,
		);

		// DELETE /proposed-changes/:id
		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read) },
			ProposedChangesController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
