/* * */

import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { type RidePermission } from '@tmlmobilidade/types';

import { RideAcceptanceController } from './ride-acceptance.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/rides/:trip_id/acceptance';

/* * */

server.register(
	(instance, opts, next) => {
		//

		// GET /rides/:id/justification
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.justification_read) },
			RideAcceptanceController.get,
		);

		// PUT /rides/:id/justification/change-status
		instance.put(
			'/change-status',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.justification_change_status) },
			RideAcceptanceController.changeStatus,
		);

		// PUT /rides/:id/justification/justify
		instance.put(
			'/justify',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.justification_justify) },
			RideAcceptanceController.justify,
		);

		// PUT /rides/:id/justification/comment
		instance.post(
			'/comment',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, [Permissions.rides.actions.justification_justify, Permissions.rides.actions.justification_change_status]) },
			RideAcceptanceController.comment,
		);

		// PUT /rides/:id/justification/lock
		instance.put(
			'/lock',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.justification_lock) },
			RideAcceptanceController.lock,
		);

		next();
	},
	{ prefix: namespace },
);
