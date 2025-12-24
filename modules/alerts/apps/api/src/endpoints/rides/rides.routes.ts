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
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read_scheduled, PermissionCatalog.all.alerts.actions.read_realtime]) },
			RidesSharedController.getBatch,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
