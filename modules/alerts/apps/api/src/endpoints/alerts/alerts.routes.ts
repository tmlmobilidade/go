/* * */

import { AlertsController } from '@/endpoints/alerts/alerts.controller.js';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { type GetAllAlertsQuery, GetAllAlertsQuerySchema, PermissionCatalog } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';

/* * */

const namespace = '/alerts';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				if (parsedQuery.realtime === true) await authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.read])(request);
				else await authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.read])(request);
			} },
			AlertsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				if (parsedQuery.realtime === true) await authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.read])(request);
				else await authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.read])(request);
			} },
			AlertsController.getById,
		);

		instance.get(
			'/:id/image',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				if (parsedQuery.realtime === true) await authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.read])(request);
				else await authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.read])(request);
			} },
			AlertsController.getImage,
		);

		instance.post(
			'/',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				if (parsedQuery.realtime === true) await authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.create])(request);
				else await authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.create])(request);
			} },
			AlertsController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				if (parsedQuery.realtime === true) await authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.update])(request);
				else await authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.update])(request);
			} },
			AlertsController.update,
		);

		instance.delete(
			'/:id',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				if (parsedQuery.realtime === true) await authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.delete])(request);
				else await authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.delete])(request);
			} },
			AlertsController.delete,
		);

		instance.post(
			'/:id/image',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				if (parsedQuery.realtime === true) await authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.update])(request);
				else await authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.update])(request);
			} },
			AlertsController.uploadImage,
		);

		instance.delete(
			'/:id/image',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				if (parsedQuery.realtime === true) await authorizationMiddleware(PermissionCatalog.all.alerts_realtime.scope, [PermissionCatalog.all.alerts_realtime.actions.update])(request);
				else await authorizationMiddleware(PermissionCatalog.all.alerts_scheduled.scope, [PermissionCatalog.all.alerts_scheduled.actions.update])(request);
			} },
			AlertsController.deleteImage,
		);

		instance.get(
			'/gtfs',
			AlertsController.getGtfs,
		);

		next();
	},
	{ prefix: namespace },
);
