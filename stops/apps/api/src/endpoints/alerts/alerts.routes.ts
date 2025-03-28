/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import FastifyService from '@/services/fastify.service.js';
import { Permissions } from '@tmlmobilidade/lib';
import { Stop } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { StopsController } from './stops.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/stops';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /stops
		instance.get(
			'/',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.list,
				),
			},
			StopsController.getAll,
		);

		// GET /stops/:id
		instance.get(
			'/:id',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.read,
				),
			},
			StopsController.getById,
		);

		// POST /stops
		instance.post(
			'/',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.create,
				),
			},
			StopsController.create,
		);

		// PUT /stops/:id
		instance.put(
			'/:id',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.update,
				),
			},
			StopsController.update,
		);

		// DELETE /stops/:id
		instance.delete(
			'/:id',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.delete,
				),
			},
			StopsController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
