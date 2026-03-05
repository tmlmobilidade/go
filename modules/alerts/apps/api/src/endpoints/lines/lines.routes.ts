import { LineByHashedTrip, LinesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyInstance, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { type Line, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

interface GetHashedTripsQuery {
	hashed_trip_ids: string[]
}

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
			(request: FastifyRequest, reply: FastifyReply<Line[]>) => LinesSharedController.getAll(request, reply),
		);

		instance.get(
			'/hashed-trips',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetHashedTripsQuery }>, reply: FastifyReply<LineByHashedTrip[]>) => LinesSharedController.getAllLinesIdsByHashedTrip(request, reply),
		);

		//
	},
	{ prefix: NAMESPACE },
);
