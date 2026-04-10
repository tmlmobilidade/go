/* * */

import { RidesController } from '@/endpoints/rides/rides.controller.js';
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
			RidesController.getHashedTripByRideId,
		);

		instance.get(
			'/:id/hashed-shape',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			RidesController.getHashedShapeByRideId,
		);

		instance.get(
			'/:id/vehicle-events',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			RidesController.getVehicleEventsByRideId,
		);

		instance.get(
			'/:id/simplified-apex-locations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			RidesController.getSimplifiedApexLocationsByRideId,
		);

		instance.get(
			'/:id/simplified-apex-validations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			RidesController.getSimplifiedApexValidationsByRideId,
		);

		instance.get(
			'/:id/simplified-apex-on-board-sales',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			RidesController.getSimplifiedApexOnBoardSalesByRideId,
		);

		instance.get(
			'/:id/simplified-apex-on-board-refunds',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			RidesController.getSimplifiedApexOnBoardRefundsByRideId,
		);

		instance.get(
			'/:id/reprocess',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_update]) },
			RidesController.reprocessRideById,
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
