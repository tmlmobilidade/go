/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { commentPatternHandler } from './handlers/comment-pattern.js';
import { createPatternHandler } from './handlers/create-pattern.js';
import { deletePatternHandler } from './handlers/delete-pattern.js';
import { getPatternHandler } from './handlers/get-pattern.js';
import { getPatternStopHandler } from './handlers/get-stop.js';
import { importPatternGtfsHandler } from './handlers/import-pattern-gtfs.js';
import { listPatternShapesHandler } from './handlers/list-pattern-shapes.js';
import { listPatternsStopsHandler } from './handlers/list-stops.js';
import { lockPatternHandler } from './handlers/lock-pattern.js';
import { updatePatternHandler } from './handlers/update-pattern.js';

/* * */

const NAMESPACE = '/patterns';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/shapes',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.read]) },
			listPatternShapesHandler,
		);

		instance.get(
			'/stops',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.read]) },
			listPatternsStopsHandler,
		);

		instance.get(
			'/stops/:stopId',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.read]) },
			getPatternStopHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.read]) },
			getPatternHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.create]) },
			createPatternHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.update]) },
			updatePatternHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.lock]) },
			lockPatternHandler,
		);

		instance.post(
			'/:id/import-gtfs',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.update]) },
			importPatternGtfsHandler,
		);

		instance.post(
			'/:id/comment',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.update]) },
			commentPatternHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.delete]) },
			deletePatternHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
