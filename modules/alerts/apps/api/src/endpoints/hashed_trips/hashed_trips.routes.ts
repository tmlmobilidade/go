import { HashedTripsSharedController, LinesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/hashed-trips';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

/* * */

server.register(
	async (instance) => {
		//

		// get all line identifiers and names by hashed trip ids
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			LinesSharedController.getAllLinesIdsByHashedTrip,
		);

		// get a hashed trip by id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			HashedTripsSharedController.getById,
		);

		//
	},
	{ prefix: NAMESPACE },
);
