/* * */

import { ScheduledController } from '@/endpoints/scheduled/scheduled.controller.js';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const namespace = '/scheduled';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.read]) },
			ScheduledController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.read]) },
			ScheduledController.getById,
		);

		instance.get(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.read]) },
			ScheduledController.getImage,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.create]) },
			ScheduledController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.update]) },
			ScheduledController.update,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.delete]) },
			ScheduledController.delete,
		);

		instance.post(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.update]) },
			ScheduledController.uploadImage,
		);

		instance.delete(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.update]) },
			ScheduledController.deleteImage,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.lock]) },
			ScheduledController.lock,
		);

		next();
	},
	{ prefix: namespace },
);
