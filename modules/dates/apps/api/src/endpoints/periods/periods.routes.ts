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
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.read_periods]) },
			PeriodsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.read_periods]) },
			PeriodsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.create_periods]) },
			PeriodsController.create,
		);

		instance.post(
			'/check-conflicts',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.read_periods]) },
			PeriodsController.checkConflicts,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.update_periods]) },
			PeriodsController.update,
		);

		instance.get(
			'/:id/toggle-lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.toggle_lock_periods]) },
			PeriodsController.toggleLockById,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.dates.scope, [PermissionCatalog.all.dates.actions.delete_periods]) },
			PeriodsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
