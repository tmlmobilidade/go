/* * */

import { RidesSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

/* * */

const NAMESPACE = '/rides';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts_realtime.actions.analysis_read]) },
			RidesSharedController.getBatch,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
