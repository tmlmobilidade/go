/* * */

import { ValidationsController } from '@/endpoints/validations/validations.controller.js';
import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';
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
			{
				preHandler: authorizationMiddleware<ValidationPermission>(
					Permissions.validations.scope,
					Permissions.validations.actions.list,
				),
			},
			ValidationsController.getAll,
		);

		// GET /validations/:id
		instance.get(
			'/:id',
			{
				preHandler: authorizationMiddleware<ValidationPermission>(
					Permissions.validations.scope,
					Permissions.validations.actions.read,
				),
			},
			ValidationsController.getById,
		);

		// POST /validations
		instance.post(
			'/',
			{
				preHandler: authorizationMiddleware<ValidationPermission>(
					Permissions.validations.scope,
					Permissions.validations.actions.create,
				),
			},
			ValidationsController.create,
		);

		// PUT /validations/:id
		instance.put(
			'/:id',
			{
				preHandler: authorizationMiddleware<ValidationPermission>(
					Permissions.validations.scope,
					Permissions.validations.actions.update,
				),
			},
			ValidationsController.update,
		);

		// DELETE /validations/:id
		instance.delete(
			'/:id',
			{
				preHandler: authorizationMiddleware<ValidationPermission>(
					Permissions.validations.scope,
					Permissions.validations.actions.delete,
				),
			},
			ValidationsController.delete,
		);

		// GET /validations/:id/file
		instance.get(
			'/:id/file',
			{
				preHandler: authorizationMiddleware<ValidationPermission>(
					Permissions.validations.scope,
					Permissions.validations.actions.read,
				),
			},
			ValidationsController.getFile,
		);

		next();
	},
	{ prefix: namespace },
);
