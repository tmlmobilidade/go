/* * */

import { fastifyWebsocket } from '@fastify/websocket';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
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
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listRidesHandler } from './handlers/list-rides.js';
import { updateProcessingStatusHandler } from './handlers/update-processing-status.js';

/* * */

const NAMESPACE = '/rides';

/* * */

const server = FastifyService.getInstance().server;

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
			'/list-agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			listAgenciesHandler,
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

		instance.put(
			'/:id/processing-status',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_reprocess]) },
			updateProcessingStatusHandler,
		);

		//
	},
	{ prefix: NAMESPACE },
);
