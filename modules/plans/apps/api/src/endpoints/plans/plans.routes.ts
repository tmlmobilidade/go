/* * */

import { PlansController } from '@/endpoints/plans/plans.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

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
			PlansController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			PlansController.getById,
		);

		instance.get(
			'/:id/operation-file',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			PlansController.getPlanOperationFileById,
		);

		instance.get(
			'/:id/operation-file/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			PlansController.downloadPlanOperationFileById,
		);

		instance.get(
			'/:id/posters-file',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			PlansController.getPlanPostersFileById,
		);

		instance.get(
			'/:id/posters-file/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.read]) },
			PlansController.downloadPlanPostersFileById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.create]) },
			PlansController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update]) },
			PlansController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.lock]) },
			PlansController.lock,
		);

		instance.get(
			'/:id/controller-reprocess',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update_controller]) },
			PlansController.controllerReprocessPlanById,
		);

		instance.put(
			'/:id/list-to-generate-posters',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.generate_pdf_posters]) },
			PlansController.listPlanToGeneratePosters,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.delete]) },
			PlansController.delete,
		);

		instance.post(
			'/:id/change-gtfs',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.update_gtfs_plan]) },
			PlansController.changeGtfsPlan,
		);

		instance.get('/drt-model/:id', PlansController.getDrtModel);

		next();
	},
	{ prefix: NAMESPACE },
);
