/* * */

import { RealtimeController } from '@/endpoints/realtime/realtime.controller.js';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const namespace = '/realtime';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.read]) },
			RealtimeController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.read]) },
			RealtimeController.getById,
		);

		instance.get(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.read]) },
			RealtimeController.getImage,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.create]) },
			RealtimeController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.update]) },
			RealtimeController.update,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.delete]) },
			RealtimeController.delete,
		);

		instance.post(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.update]) },
			RealtimeController.uploadImage,
		);

		instance.delete(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.update]) },
			RealtimeController.deleteImage,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.lock]) },
			RealtimeController.lock,
		);

		next();
	},
	{ prefix: namespace },
);
