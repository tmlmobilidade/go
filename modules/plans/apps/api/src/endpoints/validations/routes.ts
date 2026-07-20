/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

import { createGtfsValidation } from './controllers/create-gtfs-validation.js';
import { downloadGtfsValidationFile } from './controllers/download-gtfs-validation-file.js';
import { getAllGtfsValidations } from './controllers/get-all-gtfs-validations.js';
import { getGtfsValidationFile } from './controllers/get-gtfs-validation-file.js';
import { getGtfsValidation } from './controllers/get-gtfs-validation.js';
import { lockGtfsValidation } from './controllers/lock-gtfs-validation.js';
import { requestApproval } from './controllers/request-approval.js';
import { updateProcessingStatus } from './controllers/update-processing-status.js';

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
			getAllGtfsValidations,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			getGtfsValidation,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.create]) },
			createGtfsValidation,
		);

		instance.get(
			'/:id/file',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			getGtfsValidationFile,
		);

		instance.get(
			'/:id/file/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			downloadGtfsValidationFile,
		);

		instance.get(
			'/:id/request-approval',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.request_approval]) },
			requestApproval,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.lock]) },
			lockGtfsValidation,
		);

		instance.put(
			'/:id/processing-status',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.update_processing_status]) },
			updateProcessingStatus,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
