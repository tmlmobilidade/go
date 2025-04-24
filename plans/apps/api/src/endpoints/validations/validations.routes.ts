/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import FastifyService from '@/services/fastify.service.js';
import { Permissions } from '@tmlmobilidade/lib';
import { Validation } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { ValidationsController } from './validations.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/validations';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /validations
		instance.get(
			'/',
			{
				preHandler: authorizationMiddleware<Validation>(
					Permissions.plans.scope,
					Permissions.plans.actions.list,
				),
			},
			ValidationsController.getAll,
		);

		// GET /validations/:id
		instance.get(
			'/:id',
			{
				preHandler: authorizationMiddleware<Validation>(
					Permissions.plans.scope,
					Permissions.plans.actions.read,
				),
			},
			ValidationsController.getById,
		);

		// POST /validations
		instance.post(
			'/',
			{
				preHandler: authorizationMiddleware<Validation>(
					Permissions.plans.scope,
					Permissions.plans.actions.create,
				),
			},
			ValidationsController.create,
		);

		// PUT /validations/:id
		instance.put(
			'/:id',
			{
				preHandler: authorizationMiddleware<Validation>(
					Permissions.plans.scope,
					Permissions.plans.actions.update,
				),
			},
			ValidationsController.update,
		);

		// DELETE /validations/:id
		instance.delete(
			'/:id',
			{
				preHandler: authorizationMiddleware<Validation>(
					Permissions.plans.scope,
					Permissions.plans.actions.delete,
				),
			},
			ValidationsController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
