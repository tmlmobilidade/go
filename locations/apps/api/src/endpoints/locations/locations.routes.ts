/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import FastifyService from '@/services/fastify.service.js';
import { Permissions } from '@tmlmobilidade/lib';
import { Alert } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { LocationsController } from './locations.controller.js';

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
					Permissions.alerts.actions.list,
				),
			},
			LocationsController.getAll,
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
			LocationsController.getById,
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
			LocationsController.create,
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
			LocationsController.update,
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
			LocationsController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
