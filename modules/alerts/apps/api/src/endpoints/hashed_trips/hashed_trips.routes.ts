import { HashedTripsSharedController, LineByHashedTrip, LinesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyInstance, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { type HashedTrip, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/hashed-trips';

/* * */

interface GetHashedTripsQuery {
	agency_id?: string
	date_end?: number | string
	date_start?: number | string
	hashed_trip_ids?: string | string[]
}

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
			(request: FastifyRequest<{ Querystring: GetHashedTripsQuery }>, reply: FastifyReply<LineByHashedTrip[]>) => LinesSharedController.getAllLinesIdsByHashedTrip(request, reply),
		);

		// get a hashed trip by id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HashedTrip>) => HashedTripsSharedController.getById(request, reply),
		);

		//
	},
	{ prefix: NAMESPACE },
);
