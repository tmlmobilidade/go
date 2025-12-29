/* * */

import { PeriodsController } from '@/endpoints/periods/periods.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/periods';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.periods.scope, [PermissionCatalog.all.periods.actions.read]) },
			PeriodsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.periods.scope, [PermissionCatalog.all.periods.actions.read]) },
			PeriodsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.periods.scope, [PermissionCatalog.all.periods.actions.create]) },
			PeriodsController.create,
		);

		instance.post(
			'/check-conflicts',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.periods.scope, [PermissionCatalog.all.periods.actions.read]) },
			PeriodsController.checkConflicts,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.periods.scope, [PermissionCatalog.all.periods.actions.update]) },
			PeriodsController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.periods.scope, [PermissionCatalog.all.periods.actions.lock]) },
			PeriodsController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.periods.scope, [PermissionCatalog.all.periods.actions.delete]) },
			PeriodsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
