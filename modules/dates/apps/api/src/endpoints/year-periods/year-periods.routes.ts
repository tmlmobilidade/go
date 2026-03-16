/* * */

import { YearPeriodsController } from '@/endpoints/year-periods/year-periods.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/year-periods';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.read]) },
			YearPeriodsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.read]) },
			YearPeriodsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.create]) },
			YearPeriodsController.create,
		);

		instance.post(
			'/check-conflicts',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.read]) },
			YearPeriodsController.checkConflicts,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.update]) },
			YearPeriodsController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.lock]) },
			YearPeriodsController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.delete]) },
			YearPeriodsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
