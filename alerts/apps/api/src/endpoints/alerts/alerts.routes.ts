/* * */

import { AlertsController } from '@/endpoints/alerts/alerts.controller';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { Alert, GetAllAlertsQuery, GetAllAlertsQuerySchema } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
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
			{ preHandler: async (request, reply, done) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.read)(request);
				done();
			} },
			AlertsController.getAll,
		);

		// GET /alerts/:id
		instance.get(
			'/:id',
			{ preHandler: async (request, reply, done) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.read)(request);
				done();
			} },
			AlertsController.getById,
		);

		// GET /alerts/:id/image
		instance.get(
			'/:id/image',
			{ preHandler: async (request, reply, done) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.read)(request);
				done();
			} },
			AlertsController.getImage,
		);

		// POST /alerts
		instance.post(
			'/',
			{ preHandler: async (request, reply, done) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.create)(request);
				done();
			} },
			AlertsController.create,
		);

		// PUT /alerts/:id
		instance.put(
			'/:id',
			{ preHandler: async (request, reply, done) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.update)(request);
				done();
			} },
			AlertsController.update,
		);

		// DELETE /alerts/:id
		instance.delete(
			'/:id',
			{ preHandler: async (request, reply, done) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.delete)(request);
				done();
			} },
			AlertsController.delete,
		);

		// POST /alerts/:id/image
		instance.post(
			'/:id/image',
			{ preHandler: async (request, reply, done) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.update)(request);
				done();
			} },
			AlertsController.uploadImage,
		);

		// DELETE /alerts/:id/image
		instance.delete(
			'/:id/image',
			{ preHandler: async (request, reply, done) => {
				const parsedQuery = validateQueryParams<GetAllAlertsQuery>(request.query, GetAllAlertsQuerySchema);
				const scope = parsedQuery.realtime === true ? Permissions.alerts_realtime.scope : Permissions.alerts.scope;
				await authorizationMiddleware<Alert>(scope, Permissions.alerts.actions.update)(request);
				done();
			} },
			AlertsController.deleteImage,
		);

		// GET /alerts/gtfs
		instance.get('/gtfs', AlertsController.getGtfs);

		next();
	},
	{ prefix: namespace },
);
