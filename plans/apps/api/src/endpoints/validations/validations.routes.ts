/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import FastifyService from '@/services/fastify.service.js';
import { Permissions } from '@tmlmobilidade/lib';
import { ValidationPermission } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { ValidationsController } from './validations.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
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
					request => [{ resource_key: 'agency_ids', value: request.params['id'] }],
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
					request => [{ resource_key: 'agency_ids', value: request.body['gtfs_agency']['agency_id'] }],
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
					request => [{ resource_key: 'agency_ids', value: request.params['id'] }],
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
					request => [{ resource_key: 'agency_ids', value: request.params['id'] }],
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
					request => [{ resource_key: 'agency_ids', value: request.params['id'] }],
				),
			},
			ValidationsController.getFile,
		);

		next();
	},
	{ prefix: namespace },
);
