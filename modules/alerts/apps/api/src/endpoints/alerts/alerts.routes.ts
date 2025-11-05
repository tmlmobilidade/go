/* * */

import { AlertsController } from '@/endpoints/alerts/alerts.controller.js';
import { authorizationMiddleware, FastifyService } from '@go/connectors-fastify';
import { Permissions } from '@go/lib';
import { Alert, GetAllAlertsQuery, GetAllAlertsQuerySchema } from '@go/types';
import { validateQueryParams } from '@go/utils';
import { FastifyInstance } from 'fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/alerts';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /alerts
		instance.get(
			'/',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.read)(request);
			} },
			AlertsController.getAll,
		);

		// GET /alerts/:id
		instance.get(
			'/:id',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.read)(request);
			} },
			AlertsController.getById,
		);

		// GET /alerts/:id/image
		instance.get(
			'/:id/image',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.read)(request);
			} },
			AlertsController.getImage,
		);

		// POST /alerts
		instance.post(
			'/',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.create)(request);
			} },
			AlertsController.create,
		);

		// PUT /alerts/:id
		instance.put(
			'/:id',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.update)(request);
			} },
			AlertsController.update,
		);

		// DELETE /alerts/:id
		instance.delete(
			'/:id',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.delete)(request);
			} },
			AlertsController.delete,
		);

		// POST /alerts/:id/image
		instance.post(
			'/:id/image',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.update)(request);
			} },
			AlertsController.uploadImage,
		);

		// DELETE /alerts/:id/image
		instance.delete(
			'/:id/image',
			{ preHandler: async (request) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.update)(request);
			} },
			AlertsController.deleteImage,
		);

		// GET /alerts/gtfs
		instance.get('/gtfs', AlertsController.getGtfs);

		next();
	},
	{ prefix: namespace },
);
