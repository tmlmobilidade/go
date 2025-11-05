/* * */

import { RidesController } from '@/endpoints/rides/rides.controller.js';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/go-lib';
import { type RidePermission } from '@tmlmobilidade/go-types';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/rides';

/* * */

server.register(
	(instance, opts, next) => {
		//

		// GET /rides
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getBatch,
		);

		// GET /rides/ws
		instance.get(
			'/ws',
			{
				preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read),
				websocket: true,
			},
			RidesController.websocket,
		);

		// GET /rides/:id/ride
		instance.get(
			'/:id/ride',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getRideById,
		);

		// GET /rides/:id/hashed-trip
		instance.get(
			'/:id/hashed-trip',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getHashedTripByRideId,
		);

		// GET /rides/:id/hashed-shape
		instance.get(
			'/:id/hashed-shape',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getHashedShapeByRideId,
		);

		// GET /rides/:id/vehicle-events
		instance.get(
			'/:id/vehicle-events',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getVehicleEventsByRideId,
		);

		// GET /rides/:id/simplified-apex-locations
		instance.get(
			'/:id/simplified-apex-locations',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getSimplifiedApexLocationsByRideId,
		);

		// GET /rides/:id/simplified-apex-validations
		instance.get(
			'/:id/simplified-apex-validations',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getSimplifiedApexValidationsByRideId,
		);

		// GET /rides/:id/simplified-apex-on-board-sales
		instance.get(
			'/:id/simplified-apex-on-board-sales',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getSimplifiedApexOnBoardSalesByRideId,
		);

		// GET /rides/:id/simplified-apex-on-board-refunds
		instance.get(
			'/:id/simplified-apex-on-board-refunds',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_read) },
			RidesController.getSimplifiedApexOnBoardRefundsByRideId,
		);

		// GET /rides/:id/reprocess
		instance.get(
			'/:id/reprocess',
			{ preHandler: authorizationMiddleware<RidePermission>(Permissions.rides.scope, Permissions.rides.actions.analysis_update) },
			RidesController.reprocessRideById,
		);

		next();
	},
	{ prefix: namespace },
);
