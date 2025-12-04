/* * */

import { RidesController } from '@/endpoints/rides/rides.controller.js';
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
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			RidesController.getBatch,
		);

		instance.get(
			'/selected',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.rides.scope, [PermissionCatalog.all.rides.actions.analysis_read]) },
			RidesController.getSelectedRides,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
