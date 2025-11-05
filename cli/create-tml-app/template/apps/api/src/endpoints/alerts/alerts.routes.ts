/* * */

import { AlertsController } from '@/endpoints/alerts/alerts.controller.js';
import { authorizationMiddleware, FastifyService } from '@go/connectors-fastify';
import { Permissions } from '@go/lib';
import { Alert } from '@go/types';
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
			{
				preHandler: authorizationMiddleware<Alert>(
					Permissions.alerts.scope,
					Permissions.alerts.actions.read,
				),
			},
			AlertsController.getAll,
		);

		// GET /alerts/:id
		instance.get(
			'/:id',
			{
				preHandler: authorizationMiddleware<Alert>(
					Permissions.alerts.scope,
					Permissions.alerts.actions.read,
				),
			},
			AlertsController.getById,
		);

		// POST /alerts
		instance.post(
			'/',
			{
				preHandler: authorizationMiddleware<Alert>(
					Permissions.alerts.scope,
					Permissions.alerts.actions.create,
				),
			},
			AlertsController.create,
		);

		// PUT /alerts/:id
		instance.put(
			'/:id',
			{
				preHandler: authorizationMiddleware<Alert>(
					Permissions.alerts.scope,
					Permissions.alerts.actions.update,
				),
			},
			AlertsController.update,
		);

		// DELETE /alerts/:id
		instance.delete(
			'/:id',
			{
				preHandler: authorizationMiddleware<Alert>(
					Permissions.alerts.scope,
					Permissions.alerts.actions.delete,
				),
			},
			AlertsController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
