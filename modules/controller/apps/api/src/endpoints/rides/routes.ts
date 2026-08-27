/* * */

import { fastifyWebsocket } from '@fastify/websocket';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { getSimplifiedApexBankingTapsHandler } from './handlers/get-apex-banking-taps.js';
import { getSimplifiedApexLocationsHandler } from './handlers/get-apex-locations.js';
import { getSimplifiedApexOnBoardRefundsHandler } from './handlers/get-apex-refunds.js';
import { getSimplifiedApexOnBoardSalesHandler } from './handlers/get-apex-sales.js';
import { getSimplifiedApexValidationsHandler } from './handlers/get-apex-validations.js';
import { getHashedShapeHandler } from './handlers/get-hashed-shape.js';
import { getHashedTripHandler } from './handlers/get-hashed-trip.js';
import { getRideAnalysesHandler } from './handlers/get-ride-analyses.js';
import { getRideHandler } from './handlers/get-ride.js';
import { getSimplifiedVehicleEventsHandler } from './handlers/get-vehicle-events.js';
import { listRidesHandler } from './handlers/list-rides.js';
import { reprocessRideHandler } from './handlers/reprocess-ride.js';

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
			listRidesHandler,
		);

		instance.get(
			'/:id/ride',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getRideHandler,
		);

		instance.get(
			'/:id/hashed-shape',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getHashedShapeHandler,
		);

		instance.get(
			'/:id/hashed-trip',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getHashedTripHandler,
		);

		instance.get(
			'/:id/analyses',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getRideAnalysesHandler,
		);

		instance.get(
			'/:id/vehicle-events',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedVehicleEventsHandler,
		);

		instance.get(
			'/:id/apex-banking-taps',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexBankingTapsHandler,
		);

		instance.get(
			'/:id/apex-locations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexLocationsHandler,
		);

		instance.get(
			'/:id/apex-validations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexValidationsHandler,
		);

		instance.get(
			'/:id/apex-sales',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexOnBoardSalesHandler,
		);

		instance.get(
			'/:id/apex-refunds',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			getSimplifiedApexOnBoardRefundsHandler,
		);

		instance.get(
			'/:id/reprocess',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_update]) },
			reprocessRideHandler,
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
