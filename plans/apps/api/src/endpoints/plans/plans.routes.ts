/* * */

import { PlansController } from '@/endpoints/plans/plans.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { PlanPermission } from '@tmlmobilidade/types';

/* * */

const server = FastifyService.getInstance().server;
const namespace = '/plans';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /plans
		instance.get(
			'/approved',
			PlansController.getApprovedPlans,
		);
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
				),
			},
			PlansController.delete,
		);

		next();
	},
	{ prefix: namespace },
);
