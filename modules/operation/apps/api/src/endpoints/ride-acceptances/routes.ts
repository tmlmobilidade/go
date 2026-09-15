/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { addCommentHandler } from './handlers/add-comment.js';
import { changeStatusHandler } from './handlers/change-status.js';
import { getRideAcceptanceHandler } from './handlers/get-ride-acceptance.js';
import { justifyRideHandler } from './handlers/justify-ride.js';
import { lockRideAcceptanceHandler } from './handlers/lock-ride-acceptance.js';

/* * */

const NAMESPACE = '/ride-acceptances/:id';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_read]) },
			getRideAcceptanceHandler,
		);

		instance.put(
			'/change-status',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_change_status]) },
			changeStatusHandler,
		);

		instance.put(
			'/justify',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_justify]) },
			justifyRideHandler,
		);

		instance.post(
			'/comment',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_justify, PermissionCatalog.all.rides.actions.acceptance_change_status]) },
			addCommentHandler,
		);

		instance.put(
			'/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_lock]) },
			lockRideAcceptanceHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
