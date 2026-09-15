/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { checkConflictsHandler } from './handlers/check-conflicts.js';
import { createYearPeriodHandler } from './handlers/create-year-period.js';
import { deleteYearPeriodHandler } from './handlers/delete-year-period.js';
import { getYearPeriodHandler } from './handlers/get-year-period.js';
import { listYearPeriodsHandler } from './handlers/list-year-periods.js';
import { lockYearPeriodHandler } from './handlers/lock-year-period.js';
import { updateYearPeriodHandler } from './handlers/update-year-period.js';

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
			listYearPeriodsHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.read]) },
			getYearPeriodHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.create]) },
			createYearPeriodHandler,
		);

		instance.post(
			'/check-conflicts',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.read]) },
			checkConflictsHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.update]) },
			updateYearPeriodHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.lock]) },
			lockYearPeriodHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.year_periods.scope, [PermissionCatalog.all.year_periods.actions.delete]) },
			deleteYearPeriodHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
