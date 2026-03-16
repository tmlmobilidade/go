/* * */

import { HolidaysController } from '@/endpoints/holidays/holidays.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/holidays';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.read]) },
			HolidaysController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.read]) },
			HolidaysController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.create]) },
			HolidaysController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.update]) },
			HolidaysController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.lock]) },
			HolidaysController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.delete]) },
			HolidaysController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
