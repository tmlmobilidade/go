/* * */

import { EventsController } from '@/endpoints/events/events.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/events';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.read]) },
			EventsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.read]) },
			EventsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.create]) },
			EventsController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.update]) },
			EventsController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.lock]) },
			EventsController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.delete]) },
			EventsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
