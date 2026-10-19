/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createStopHandler } from './handlers/create-stop.js';
import { deleteStopHandler } from './handlers/delete-stop.js';
import { getStopLocationHandler } from './handlers/get-stop-location.js';
import { getStopHandler } from './handlers/get-stop.js';
import { getTtsHandler } from './handlers/get-tts.js';
import { getValidIdHandler } from './handlers/get-valid-id.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listLocationsHandler } from './handlers/list-locations.js';
import { listStopsHandler } from './handlers/list-stops.js';
import { lockStopHandler } from './handlers/lock-stop.js';
import { updateStopCoordinatesHandler } from './handlers/update-stop-coordinates.js';
import { updateStopNameHandler } from './handlers/update-stop-name.js';
import { updateStopHandler } from './handlers/update-stop.js';

/* * */

const NAMESPACE = '/stops';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.read]) },
			listStopsHandler,
		);

		instance.post(
			'/list-agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.read]) },
			listAgenciesHandler,
		);

		instance.post(
			'/list-locations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.read]) },
			listLocationsHandler,
		);

		instance.post(
			'/get-stop-location',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.read]) },
			getStopLocationHandler,
		);

		instance.get(
			'/get/valid-id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.read]) },
			getValidIdHandler,
		);

		instance.get(
			'/get/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.read]) },
			getStopHandler,
		);

		instance.get(
			'/get/tts/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.read]) },
			getTtsHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.create]) },
			createStopHandler,
		);

		instance.put(
			'/update/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.update]) },
			updateStopHandler,
		);

		instance.put(
			'/update-name/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.edit_name]) },
			updateStopNameHandler,
		);

		instance.put(
			'/update-coordinates/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.edit_coordinates]) },
			updateStopCoordinatesHandler,
		);

		instance.get(
			'/lock/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.lock]) },
			lockStopHandler,
		);

		instance.delete(
			'/delete/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.stops.scope, [PermissionCatalog.all.stops.actions.delete]) },
			deleteStopHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
