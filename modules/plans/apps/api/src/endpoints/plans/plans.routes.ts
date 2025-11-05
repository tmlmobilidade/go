/* * */

import { PlansController } from '@/endpoints/plans/plans.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors-fastify';
import { Permissions } from '@tmlmobilidade/consts';
import { type PlanPermission } from '@tmlmobilidade/types';

/* * */

const server = FastifyService.getInstance().server;
const namespace = '/plans';

/* * */

server.register(
	(instance, opts, next) => {
		//

		// GET /plans
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<PlanPermission>(Permissions.plans.scope, Permissions.plans.actions.read) },
			PlansController.getAll,
		);

		// GET /plans/:id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware<PlanPermission>(Permissions.plans.scope, Permissions.plans.actions.read) },
			PlansController.getById,
		);

		// GET /plans/:id/operation-file
		instance.get(
			'/:id/operation-file',
			{ preHandler: authorizationMiddleware<PlanPermission>(Permissions.plans.scope, Permissions.plans.actions.read) },
			PlansController.getPlanOperationFileById,
		);

		// POST /plans
		instance.post(
			'/',
			{ preHandler: authorizationMiddleware<PlanPermission>(Permissions.plans.scope, Permissions.plans.actions.create) },
			PlansController.create,
		);

		// PUT /plans/:id
		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware<PlanPermission>(Permissions.plans.scope, Permissions.plans.actions.update) },
			PlansController.update,
		);

		// GET /plans/:id/toggle-lock
		instance.get(
			'/:id/toggle-lock',
			{ preHandler: authorizationMiddleware<PlanPermission>(Permissions.plans.scope, Permissions.plans.actions.toggle_lock) },
			PlansController.toggleLockById,
		);

		// GET /plans/:id/reprocess
		instance.get(
			'/:id/controller-reprocess',
			{ preHandler: authorizationMiddleware<PlanPermission>(Permissions.plans.scope, Permissions.plans.actions.update_controller) },
			PlansController.controllerReprocessPlanById,
		);

		// DELETE /plans/:id
		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware<PlanPermission>(Permissions.plans.scope, Permissions.plans.actions.delete) },
			PlansController.delete,
		);

		// PUT /plans/:id/
		instance.post(
			'/:id/change-gtfs',
			{ preHandler: authorizationMiddleware<PlanPermission>(Permissions.plans.scope, Permissions.plans.actions.update_gtfs_plan) },
			PlansController.changeGtfsPlan,
		);

		// GET /plans/approved
		instance.get('/approved', PlansController.getApprovedPlans);

		// GET /plans/drt-model.db
		instance.get('/drt-model.db', PlansController.getDrtModel);

		next();
	},
	{ prefix: namespace },
);
