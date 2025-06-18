/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import FastifyService from '@/services/fastify.service.js';
import { Permissions } from '@tmlmobilidade/lib';
import { PlanPermission } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { PlansController } from './plans.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/plans';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /plans
		instance.get(
			'/',
			{
				preHandler: authorizationMiddleware<PlanPermission>(
					Permissions.plans.scope,
					Permissions.plans.actions.list,
				),
			},
			PlansController.getAll,
		);

		// GET /plans/:id
		instance.get(
			'/:id',
			{
				preHandler: authorizationMiddleware<PlanPermission>(
					Permissions.plans.scope,
					Permissions.plans.actions.read,
					['agency_ids'],
				),
			},
			PlansController.getById,
		);

		// POST /plans
		instance.post(
			'/',
			{
				preHandler: authorizationMiddleware<PlanPermission>(
					Permissions.plans.scope,
					Permissions.plans.actions.create,
					['agency_ids'],
				),
			},
			PlansController.create,
		);

		// PUT /plans/:id
		instance.put(
			'/:id',
			{
				preHandler: authorizationMiddleware<PlanPermission>(
					Permissions.plans.scope,
					Permissions.plans.actions.update,
					['agency_ids'],
				),
			},
			PlansController.update,
		);

		// DELETE /plans/:id
		instance.delete(
			'/:id',
			{
				preHandler: authorizationMiddleware<PlanPermission>(
					Permissions.plans.scope,
					Permissions.plans.actions.delete,
					['agency_ids'],
				),
			},
			PlansController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
