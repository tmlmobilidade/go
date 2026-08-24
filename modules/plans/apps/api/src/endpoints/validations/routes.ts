/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

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

		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware('gtfs_validations', ['read']) },
			getAllGtfsValidations,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware('gtfs_validations', ['read']) },
			getGtfsValidation,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware('gtfs_validations', ['create']) },
			createGtfsValidation,
		);

		instance.get(
			'/:id/file',
			{ preHandler: authorizationMiddleware('gtfs_validations', ['read']) },
			getGtfsValidationFile,
		);

		instance.get(
			'/:id/file/download',
			{ preHandler: authorizationMiddleware('gtfs_validations', ['read']) },
			downloadGtfsValidationFile,
		);

		instance.get(
			'/:id/request-approval',
			{ preHandler: authorizationMiddleware('gtfs_validations', ['request_approval']) },
			requestApproval,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware('gtfs_validations', ['lock']) },
			lockGtfsValidation,
		);

		instance.put(
			'/:id/processing-status',
			{ preHandler: authorizationMiddleware('gtfs_validations', ['update_processing_status']) },
			updateProcessingStatus,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
