/* * */

import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { addComment } from './handlers/add-comment.js';
import { changeStatus } from './handlers/change-status.js';
import { getRideAcceptance } from './handlers/get-ride-acceptance.js';
import { justifyRide } from './handlers/justify-ride.js';
import { lockRideAcceptance } from './handlers/lock-ride-acceptance.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/rides/:id/acceptance';

/* * */

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_read]) },
			getRideAcceptance,
		);

		instance.put(
			'/change-status',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_change_status]) },
			changeStatus,
		);

		instance.put(
			'/justify',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_justify]) },
			justifyRide,
		);

		instance.post(
			'/comment',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_justify, PermissionCatalog.all.rides.actions.acceptance_change_status]) },
			addComment,
		);

		instance.put(
			'/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_lock]) },
			lockRideAcceptance,
		);

		next();
	},
	{ prefix: namespace },
);
