/* * */

import { RidesController } from '@/endpoints/rides/rides.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { type HashedShape, type HashedTrip, type Ride, type SimplifiedApexValidation, type VehicleEvent } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/rides';

/* * */

server.register(
	(instance, opts, next) => {
	// GET /rides
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<Ride>(Permissions.rides.scope, Permissions.rides.actions.list) },
			RidesController.getBatch,
		);

		// GET /rides/ws
		instance.get(
			'/ws',
			{
				preHandler: authorizationMiddleware<Ride>(Permissions.rides.scope, Permissions.rides.actions.list),
				websocket: true,
			},
			RidesController.websocket,
		);

		// GET /rides/:id/ride
		instance.get(
			'/:id/ride',
			{ preHandler: authorizationMiddleware<Ride>(Permissions.rides.scope, Permissions.rides.actions.read) },
			RidesController.getRideById,
		);

		// GET /rides/:id/hashed-trip
		instance.get(
			'/:id/hashed-trip',
			{ preHandler: authorizationMiddleware<HashedTrip>(Permissions.rides.scope, Permissions.rides.actions.read) },
			RidesController.getHashedTripByRideId,
		);

		// GET /rides/:id/hashed-shape
		instance.get(
			'/:id/hashed-shape',
			{ preHandler: authorizationMiddleware<HashedShape>(Permissions.rides.scope, Permissions.rides.actions.read) },
			RidesController.getHashedShapeByRideId,
		);

		// GET /rides/:id/vehicle-events
		instance.get(
			'/:id/vehicle-events',
			{ preHandler: authorizationMiddleware<VehicleEvent>(Permissions.rides.scope, Permissions.rides.actions.read) },
			RidesController.getVehicleEventsByRideId,
		);

		// GET /rides/:id/simplified-apex-validations
		instance.get(
			'/:id/simplified-apex-validations',
			{ preHandler: authorizationMiddleware<SimplifiedApexValidation>(Permissions.rides.scope, Permissions.rides.actions.read) },
			RidesController.getSimplifiedApexValidationsByRideId,
		);

		next();
	},
	{ prefix: namespace },
);
