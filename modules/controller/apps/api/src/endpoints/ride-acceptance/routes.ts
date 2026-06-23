/* * */

import { addComment } from '@/endpoints/ride-acceptance/controllers/add-comment.js';
import { changeStatus } from '@/endpoints/ride-acceptance/controllers/change-status.js';
import { getRideAcceptance } from '@/endpoints/ride-acceptance/controllers/get-ride-acceptance.js';
import { justifyRide } from '@/endpoints/ride-acceptance/controllers/justify-ride.js';
import { lockRideAcceptance } from '@/endpoints/ride-acceptance/controllers/lock-ride-acceptance.js';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

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
