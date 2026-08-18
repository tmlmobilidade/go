/* * */

import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

import { listLines } from './controllers/list-lines.js';
import { listRides } from './controllers/list-rides.js';
import { listStops } from './controllers/list-stops.js';

/* * */

const namespace = '/operation';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/lines',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.create]) },
			listLines,
		);

		instance.post(
			'/rides',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.create]) },
			listRides,
		);

		instance.post(
			'/stops',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.create]) },
			listStops,
		);

		next();
	},
	{ prefix: namespace },
);
