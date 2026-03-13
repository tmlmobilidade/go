import { MunicipalitiesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

const NAMESPACE = '/municipality';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.home.scope, [PermissionCatalog.all.home.actions.read_wiki]) },
			MunicipalitiesSharedController.getAggregation,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
