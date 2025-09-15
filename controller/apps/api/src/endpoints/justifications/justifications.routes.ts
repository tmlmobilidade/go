/* * */

import { JustificationsController } from '@/endpoints/justifications/justifications.controller.js';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { type RidePermission } from '@tmlmobilidade/types';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/rides/:id/justification';

/* * */

server.register(
	(instance, opts, next) => {
		//

		// GET /rides/:id/justification
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.justification_read) },
			JustificationsController.getAll,
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
		instance.put(
			'/comment',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, [Permissions.rides.actions.justification_justify, Permissions.rides.actions.justification_change_status]) },
			JustificationsController.comment,
		);

		next();
	},
	{ prefix: namespace },
);
