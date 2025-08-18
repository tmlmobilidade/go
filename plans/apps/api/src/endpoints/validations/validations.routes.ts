/* * */

import { ValidationsController } from '@/endpoints/validations/validations.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { ValidationPermission } from '@tmlmobilidade/types';

/* * */

const server = FastifyService.getInstance().server;
const namespace = '/validations';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /validations
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware<ValidationPermission>(Permissions.validations.scope, Permissions.validations.actions.read) },
			ValidationsController.getAll,
		);

		// GET /validations/:id
		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware<ValidationPermission>(Permissions.validations.scope, Permissions.validations.actions.read) },
			ValidationsController.getById,
		);

		// POST /validations
		instance.post(
			'/',
			{ preHandler: authorizationMiddleware<ValidationPermission>(Permissions.validations.scope, Permissions.validations.actions.create) },
			ValidationsController.create,
		);

		// GET /validations/:id/file
		instance.get(
			'/:id/file',
			{ preHandler: authorizationMiddleware<ValidationPermission>(Permissions.validations.scope, Permissions.validations.actions.read) },
			ValidationsController.getFile,
		);

		// POST /validations/:id/request-approval
		instance.get(
			'/:id/request-approval',
			{ preHandler: authorizationMiddleware<ValidationPermission>(Permissions.validations.scope, Permissions.validations.actions.request_approval) },
			ValidationsController.requestApproval,
		);
		next();
	},
	{ prefix: namespace },
);
