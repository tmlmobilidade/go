import { LinesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/lines';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

/* * */

server.register(
	async (instance) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			LinesSharedController.getAll,
		);

		instance.get(
			'/hashed-trips',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			LinesSharedController.getAllLinesIdsByHashedTrip,
		);

		//
	},
	{ prefix: NAMESPACE },
);
