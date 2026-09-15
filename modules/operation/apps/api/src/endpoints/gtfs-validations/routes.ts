/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { approveGtfsValidationHandler } from './handlers/approve-gtfs-validation.js';
import { createGtfsValidationHandler } from './handlers/create-gtfs-validation.js';
import { downloadGtfsValidationFileHandler } from './handlers/download-gtfs-validation-file.js';
import { getGtfsValidationFileHandler } from './handlers/get-gtfs-validation-file.js';
import { getGtfsValidationHandler } from './handlers/get-gtfs-validation.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listGtfsValidationsHandler } from './handlers/list-gtfs-validations.js';
import { lockGtfsValidationHandler } from './handlers/lock-gtfs-validation.js';
import { requestApprovalHandler } from './handlers/request-approval.js';
import { updateProcessingStatusHandler } from './handlers/update-processing-status.js';

/* * */

const NAMESPACE = '/gtfs-validations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			listGtfsValidationsHandler,
		);

		instance.post(
			'/list-agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			listAgenciesHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			getGtfsValidationHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.create]) },
			createGtfsValidationHandler,
		);

		instance.get(
			'/:id/file',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			getGtfsValidationFileHandler,
		);

		instance.get(
			'/:id/file/download',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.read]) },
			downloadGtfsValidationFileHandler,
		);

		instance.get(
			'/:id/request-approval',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.request_approval]) },
			requestApprovalHandler,
		);

		instance.get(
			'/:id/approve',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.plans.scope, [PermissionCatalog.all.plans.actions.create]) },
			approveGtfsValidationHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.lock]) },
			lockGtfsValidationHandler,
		);

		instance.put(
			'/:id/processing-status',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.gtfs_validations.scope, [PermissionCatalog.all.gtfs_validations.actions.update_processing_status]) },
			updateProcessingStatusHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
