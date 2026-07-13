/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

import { changeOperationFile } from './controllers/change-operation-file.js';
import { controllerReprocessPlan } from './controllers/controller-reprocess-plan.js';
import { createPlan } from './controllers/create-plan.js';
import { deleteApexFile } from './controllers/delete-apex-file.js';
import { deletePlan } from './controllers/delete-plan.js';
import { downloadApexFile } from './controllers/download-apex-file.js';
import { downloadOperationFile } from './controllers/download-operation-file.js';
import { getAllPlans } from './controllers/get-all-plans.js';
import { getApexFile } from './controllers/get-apex-file.js';
import { getDrtModel } from './controllers/get-drt-model.js';
import { getOperationFile } from './controllers/get-operation-file.js';
import { getPlan } from './controllers/get-plan.js';
import { lockPlan } from './controllers/lock-plan.js';
import { updateApexFile } from './controllers/update-apex-file.js';
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
			getOperationFile,
		);

		instance.get(
			'/:id/apex-file',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			getApexFile,
		);

		instance.get(
			'/:id/operation-file/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			downloadOperationFile,
		);

		instance.get(
			'/:id/apex-file/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			downloadApexFile,
		);

		instance.post(
			'/:id/apex-file',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			updateApexFile,
		);

		instance.delete(
			'/:id/apex-file',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			deleteApexFile,
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
			changeOperationFile,
		);

		instance.get('/drt-model/:id', getDrtModel);

		next();
	},
	{ prefix: NAMESPACE },
);
