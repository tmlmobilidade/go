/* * */

import { AgenciesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

/* * */

const NAMESPACE = '/agencies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware() },
			AgenciesSharedController.getAll,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
