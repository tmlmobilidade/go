/* * */

import { RideAcceptanceController } from '@/endpoints/ride-acceptance/ride-acceptance.controller.js';
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
			RideAcceptanceController.get,
		);

		instance.put(
			'/change-payment-request',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_payment_request]) },
			RideAcceptanceController.changePaymentRequest,
		);

		instance.put(
			'/change-status',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_change_status]) },
			RideAcceptanceController.changeStatus,
		);

		instance.put(
			'/justify',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_justify]) },
			RideAcceptanceController.justify,
		);

		instance.post(
			'/comment',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_justify, PermissionCatalog.all.rides.actions.acceptance_change_status]) },
			RideAcceptanceController.comment,
		);

		instance.put(
			'/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.acceptance_lock]) },
			RideAcceptanceController.lock,
		);

		next();
	},
	{ prefix: namespace },
);
