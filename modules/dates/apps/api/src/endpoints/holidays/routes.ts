/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createHolidayHandler } from './handlers/create-holiday.js';
import { deleteHolidayHandler } from './handlers/delete-holiday.js';
import { getHolidayHandler } from './handlers/get-holiday.js';
import { listHolidaysHandler } from './handlers/list-holidays.js';
import { lockHolidayHandler } from './handlers/lock-holiday.js';
import { updateHolidayHandler } from './handlers/update-holiday.js';

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
			listHolidaysHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.read]) },
			getHolidayHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.create]) },
			createHolidayHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.update]) },
			updateHolidayHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.lock]) },
			lockHolidayHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.holidays.scope, [PermissionCatalog.all.holidays.actions.delete]) },
			deleteHolidayHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
