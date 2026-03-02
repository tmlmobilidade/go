/* * */

import { GtfsValidationsController } from '@/endpoints/validations/validations.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/validations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			GtfsValidationsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			GtfsValidationsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.create]) },
			GtfsValidationsController.create,
		);

		instance.get(
			'/:id/file',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			GtfsValidationsController.getFile,
		);

		instance.get(
			'/:id/file/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			GtfsValidationsController.downloadFile,
		);

		instance.get(
			'/:id/request-approval',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.request_approval]) },
			GtfsValidationsController.requestApproval,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.lock]) },
			GtfsValidationsController.lock,
		);

		instance.put(
			'/:id/processing-status',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.update_processing_status]) },
			GtfsValidationsController.updateProcessingStatus,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
