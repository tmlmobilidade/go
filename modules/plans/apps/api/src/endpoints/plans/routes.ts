/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

import { changeGtfsOperationFile } from './controllers/change-gtfs-operation-file.js';
import { controllerReprocessPlan } from './controllers/controller-reprocess-plan.js';
import { createPlan } from './controllers/create-plan.js';
import { deletePlan } from './controllers/delete-plan.js';
import { downloadGtfsOperationFile } from './controllers/download-gtfs-operation-file.js';
import { getAllPlans } from './controllers/get-all-plans.js';
import { getDrtModel } from './controllers/get-drt-model.js';
import { getGtfsOperationFile } from './controllers/get-gtfs-operation-file.js';
import { getPlan } from './controllers/get-plan.js';
import { lockPlan } from './controllers/lock-plan.js';
import { updatePlan } from './controllers/update-plan.js';

/* * */

const NAMESPACE = '/plans';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			getAllPlans,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			getPlan,
		);

		instance.get(
			'/:id/operation-file',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			getGtfsOperationFile,
		);

		instance.get(
			'/:id/operation-file/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			downloadGtfsOperationFile,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.create]) },
			createPlan,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update]) },
			updatePlan,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.lock]) },
			lockPlan,
		);

		instance.get(
			'/:id/controller-reprocess',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update_controller]) },
			controllerReprocessPlan,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.delete]) },
			deletePlan,
		);

		instance.post(
			'/:id/change-gtfs',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update_gtfs_plan]) },
			changeGtfsOperationFile,
		);

		instance.get('/drt-model/:id', getDrtModel);

		next();
	},
	{ prefix: NAMESPACE },
);
