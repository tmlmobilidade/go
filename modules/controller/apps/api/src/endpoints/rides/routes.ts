/* * */

import { getSimplifiedApexLocations } from '@/endpoints/rides/controllers/get-apex-locations.js';
import { getSimplifiedApexOnBoardRefunds } from '@/endpoints/rides/controllers/get-apex-refunds.js';
import { getSimplifiedApexOnBoardSales } from '@/endpoints/rides/controllers/get-apex-sales.js';
import { getSimplifiedApexValidations } from '@/endpoints/rides/controllers/get-apex-validations.js';
import { getHashedShape } from '@/endpoints/rides/controllers/get-hashed-shape.js';
import { getHashedTrip } from '@/endpoints/rides/controllers/get-hashed-trip.js';
import { getSimplifiedVehicleEvents } from '@/endpoints/rides/controllers/get-vehicle-events.js';
import { reprocessRideById } from '@/endpoints/rides/controllers/reprocess-ride.js';
import { fastifyWebsocket } from '@fastify/websocket';
import { RidesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, type FastifyInstance, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { type GetRidesBatchQuery, PermissionCatalog, type RideNormalized } from '@tmlmobilidade/types';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

/* * */

const NAMESPACE = '/rides';

server.register(
	async (instance) => {
		//

		await instance.register(fastifyWebsocket);

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<RideNormalized[]>) => RidesSharedController.getBatch(request, reply, PermissionCatalog.all.rides.scope, PermissionCatalog.all.rides.actions.analysis_read),
		);

		instance.get(
			'/ws',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]), websocket: true },
			(socket) => {
				RidesSharedController.websocket(socket);
			},
		);

		instance.get(
			'/:id/ride',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<RideNormalized>) => RidesSharedController.getRideById(request, reply, PermissionCatalog.all.rides.scope, PermissionCatalog.all.rides.actions.analysis_read),
		);

		instance.get(
			'/:id/hashed-trip',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getHashedTrip,
		);

		instance.get(
			'/:id/hashed-shape',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getHashedShape,
		);

		instance.get(
			'/:id/vehicle-events',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedVehicleEvents,
		);

		instance.get(
			'/:id/simplified-apex-locations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexLocations,
		);

		instance.get(
			'/:id/simplified-apex-validations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexValidations,
		);

		instance.get(
			'/:id/simplified-apex-on-board-sales',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexOnBoardSales,
		);

		instance.get(
			'/:id/simplified-apex-on-board-refunds',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexOnBoardRefunds,
		);

		instance.get(
			'/:id/reprocess',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_update]) },
			reprocessRideById,
		);

		instance.get(
			'/favorites',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			(request: FastifyRequest<{ Querystring: { ids: string } }>, reply: FastifyReply<RideNormalized[]>) => RidesSharedController.getRideByIds(request, reply, PermissionCatalog.all.rides.scope, PermissionCatalog.all.rides.actions.analysis_read),
		);

		//
	},
	{ prefix: NAMESPACE },
);
