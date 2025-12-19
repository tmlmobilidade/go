/* * */

import { AlertsController } from '@/endpoints/scheduled/scheduled.controller.js';
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
			AlertsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.read]) },
			AlertsController.getById,
		);

		instance.get(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.read]) },
			AlertsController.getImage,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.create]) },
			AlertsController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.update]) },
			AlertsController.update,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.delete]) },
			AlertsController.delete,
		);

		instance.post(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.update]) },
			AlertsController.uploadImage,
		);

		instance.delete(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.update]) },
			AlertsController.deleteImage,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.lock]) },
			AlertsController.lock,
		);

		instance.get(
			'/gtfs',
			AlertsController.getGtfs,
		);

		next();
	},
	{ prefix: namespace },
);
