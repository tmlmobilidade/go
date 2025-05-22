/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import FastifyService from '@/services/fastify.service.js';
import { Permissions } from '@tmlmobilidade/lib';
import { Stop } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { StopsController } from './stops.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/stops';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /stops
		instance.get(
			'/',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.list,
				),
			},
			StopsController.getAll,
		);

		// GET /stops/:id
		instance.get(
			'/:id',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.read,
				),
			},
			StopsController.getById,
		);

		// POST /stops
		instance.post(
			'/',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.create,
				),
			},
			StopsController.create,
		);

		// PUT /stops/:id
		instance.put(
			'/:id',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.update,
				),
			},
			StopsController.update,
		);

		// DELETE /stops/:id
		instance.delete(
			'/:id',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.delete,
				),
			},
			StopsController.delete,
		);

		// POST /stops/:id/image
		instance.post(
			'/:id/image',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.update,
				),
			},
			StopsController.uploadImage,
		);

		// POST /stops/:id/image
		instance.post(
			'/:id/file',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.update,
				),
			},
			StopsController.uploadFile,
		);

		// DELETE /stops/:id/image
		instance.delete(
			'/:id/image/:image_id',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.update,
				),
			},
			StopsController.deleteImage,
		);

		// DELETE /stops/:id/file
		instance.delete(
			'/:id/file/:file_id',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.update,
				),
			},
			StopsController.deleteFile,
		);

		// GET /stops/:id/image
		instance.get(
			'/:id/image',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.read,
				),
			},
			StopsController.getImage,
		);

		// GET /stops/:id/images
		instance.get(
			'/:id/images',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.read,
				),
			},
			StopsController.getImages,
		)
		;
		// GET /stops/:id/files
		instance.get(
			'/:id/files',
			{
				preHandler: authorizationMiddleware<Stop>(
					Permissions.stops.scope,
					Permissions.stops.actions.read,
				),
			},
			StopsController.getFiles,
		);

		next();
	},
	{ prefix: namespace },
);
