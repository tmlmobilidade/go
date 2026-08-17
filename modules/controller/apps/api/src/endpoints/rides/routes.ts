/* * */

import { getSimplifiedApexBankingTaps } from '@/endpoints/rides/controllers/get-apex-banking-taps.js';
import { getSimplifiedApexLocations } from '@/endpoints/rides/controllers/get-apex-locations.js';
import { getSimplifiedApexOnBoardRefunds } from '@/endpoints/rides/controllers/get-apex-refunds.js';
import { getSimplifiedApexOnBoardSales } from '@/endpoints/rides/controllers/get-apex-sales.js';
import { getSimplifiedApexValidations } from '@/endpoints/rides/controllers/get-apex-validations.js';
import { getHashedTrip } from '@/endpoints/rides/controllers/get-hashed-trip.js';
import { getRideAnalyses } from '@/endpoints/rides/controllers/get-ride-analyses.js';
import { getRideById } from '@/endpoints/rides/controllers/get-ride-by-id.js';
import { getSimplifiedVehicleEvents } from '@/endpoints/rides/controllers/get-vehicle-events.js';
import { listRides } from '@/endpoints/rides/controllers/list-rides.js';
import { reprocessRideById } from '@/endpoints/rides/controllers/reprocess-ride.js';
import { fastifyWebsocket } from '@fastify/websocket';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

/* * */

const NAMESPACE = '/rides';

server.register(
	async (instance) => {
		//

		await instance.register(fastifyWebsocket);

		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			listRides,
		);

		instance.get(
			'/:id/ride',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getRideById,
		);

		instance.get(
			'/:id/hashed-trip',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getHashedTrip,
		);

		instance.get(
			'/:id/analyses',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getRideAnalyses,
		);

		instance.get(
			'/:id/vehicle-events',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedVehicleEvents,
		);

		instance.get(
			'/:id/apex-banking-taps',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexBankingTaps,
		);

		instance.get(
			'/:id/apex-locations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexLocations,
		);

		instance.get(
			'/:id/apex-validations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexValidations,
		);

		instance.get(
			'/:id/apex-sales',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexOnBoardSales,
		);

		instance.get(
			'/:id/apex-refunds',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexOnBoardRefunds,
		);

		instance.get(
			'/:id/reprocess',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_update]) },
			reprocessRideById,
		);

		// instance.get(
		// 	'/favorites',
		// 	{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
		// 	(request: FastifyRequest<{ Querystring: { ids: string } }>, reply: FastifyReply<RideNormalized[]>) => RidesSharedController.getRideByIds(request, reply, PermissionCatalog.all.rides.scope, PermissionCatalog.all.rides.actions.analysis_read),
		// );

		//
	},
	{ prefix: NAMESPACE },
);
