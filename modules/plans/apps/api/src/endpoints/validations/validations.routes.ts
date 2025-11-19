/* * */

import { GtfsValidationsController } from '@/endpoints/validations/validations.controller.js';
import { Permissions } from '@tmlmobilidade/consts';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { GtfsValidationPermission } from '@tmlmobilidade/types';

/* * */

const server = FastifyService.getInstance().server;
const namespace = '/validations';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /validations
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<GtfsValidationPermission>(Permissions.gtfs_validations.scope, Permissions.gtfs_validations.actions.read) },
			GtfsValidationsController.getAll,
		);

		// GET /validations/:id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware<GtfsValidationPermission>(Permissions.gtfs_validations.scope, Permissions.gtfs_validations.actions.read) },
			GtfsValidationsController.getById,
		);

		// POST /validations
		instance.post(
			'/',
			{ preHandler: authorizationMiddleware<GtfsValidationPermission>(Permissions.gtfs_validations.scope, Permissions.gtfs_validations.actions.create) },
			GtfsValidationsController.create,
		);

		// GET /validations/:id/file
		instance.get(
			'/:id/file',
			{ preHandler: authorizationMiddleware<GtfsValidationPermission>(Permissions.gtfs_validations.scope, Permissions.gtfs_validations.actions.read) },
			GtfsValidationsController.getFile,
		);

		// POST /validations/:id/request-approval
		instance.get(
			'/:id/request-approval',
			{ preHandler: authorizationMiddleware<GtfsValidationPermission>(Permissions.gtfs_validations.scope, Permissions.gtfs_validations.actions.request_approval) },
			GtfsValidationsController.requestApproval,
		);
		next();
	},
	{ prefix: namespace },
);
