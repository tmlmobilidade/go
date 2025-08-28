/* * */

import { AlertsRealtimeController } from '@/endpoints/realtime/alerts-realtime.controller';
import { FastifyService } from '@tmlmobilidade/connectors';
import { authorizationMiddleware } from '@tmlmobilidade/interfaces';
import { Permissions } from '@tmlmobilidade/lib';
import { Alert } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/realtime';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /realtime
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<Alert>(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.read) },
			AlertsRealtimeController.getAll,
		);

		// GET /realtime/:id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware<Alert>(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.read) },
			AlertsRealtimeController.getById,
		);

		// GET /realtime/:id/image
		instance.get(
			'/:id/image',
			{ preHandler: authorizationMiddleware<Alert>(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.read) },
			AlertsRealtimeController.getImage,
		);

		// POST /realtime
		instance.post(
			'/',
			{ preHandler: authorizationMiddleware<Alert>(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.create) },
			AlertsRealtimeController.create,
		);

		// PUT /realtime/:id
		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware<Alert>(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.update) },
			AlertsRealtimeController.update,
		);

		// DELETE /realtime/:id
		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware<Alert>(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.delete) },
			AlertsRealtimeController.delete,
		);

		// POST /realtime/:id/image
		instance.post(
			'/:id/image',
			{ preHandler: authorizationMiddleware<Alert>(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.update) },
			AlertsRealtimeController.uploadImage,
		);

		// DELETE /realtime/:id/image
		instance.delete(
			'/:id/image',
			{ preHandler: authorizationMiddleware<Alert>(Permissions.alerts_realtime.scope, Permissions.alerts_realtime.actions.update) },
			AlertsRealtimeController.deleteImage,
		);

		// GET /realtime/gtfs
		instance.get('/gtfs', AlertsRealtimeController.getGtfs);

		next();
	},
	{ prefix: namespace },
);
