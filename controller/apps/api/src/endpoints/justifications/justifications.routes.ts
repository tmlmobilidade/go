/* * */

import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { type RidePermission } from '@tmlmobilidade/types';

import { JustificationsController } from './jusitifications.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/rides/:trip_id/justification';

/* * */

server.register(
	(instance, opts, next) => {
		//

		// GET /rides/:id/justification
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.justification_read) },
			JustificationsController.get,
		);

		// PUT /rides/:id/justification/change-status
		instance.put(
			'/change-status',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.justification_change_status) },
			JustificationsController.changeStatus,
		);

		// PUT /rides/:id/justification/justify
		instance.put(
			'/justify',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.justification_justify) },
			JustificationsController.justify,
		);

		// PUT /rides/:id/justification/comment
		instance.post(
			'/comment',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, [Permissions.rides.actions.justification_justify, Permissions.rides.actions.justification_change_status]) },
			JustificationsController.comment,
		);

		// PUT /rides/:id/justification/lock
		instance.put(
			'/lock',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.justification_lock) },
			JustificationsController.lock,
		);

		next();
	},
	{ prefix: namespace },
);
