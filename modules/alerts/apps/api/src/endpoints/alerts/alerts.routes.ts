/* * */

import { AlertsController } from '@/endpoints/alerts/alerts.controller.js';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const namespace = '/alerts';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			AlertsController.getAll,
		);

		instance.get(
			'/public',
			AlertsController.getAllPublic,
		);

		instance.get(
			'.rss',
			AlertsController.getRssFeed,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			AlertsController.getById,
		);

		instance.get(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			AlertsController.getImage,
		);
		instance.get(
			'/public/:id/image',
			AlertsController.getPublicImage,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.create]) },
			AlertsController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.update]) },
			AlertsController.update,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.delete]) },
			AlertsController.delete,
		);

		instance.post(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.update]) },
			AlertsController.uploadImage,
		);

		instance.delete(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.update]) },
			AlertsController.deleteImage,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.lock]) },
			AlertsController.lock,
		);

		next();
	},
	{ prefix: namespace },
);
