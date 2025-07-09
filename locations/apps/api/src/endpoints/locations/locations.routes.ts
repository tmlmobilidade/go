/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import FastifyService from '@/services/fastify.service.js';
import { Permissions } from '@tmlmobilidade/lib';
import { Locality, Municipality, Parish } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { LocationsController } from './locations.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/locations';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /municipalities
		instance.get(
			'/municipalities',
			{
				preHandler: authorizationMiddleware<Municipality>(
					Permissions.municipalities.scope,
					Permissions.municipalities.actions.list,
				),
			},
			LocationsController.getAllMunicipalities,
		);

		// GET /alerts/:id
		instance.get(
			'/municipalities/:id',
			{
				preHandler: authorizationMiddleware<Municipality>(
					Permissions.municipalities.scope,
					Permissions.municipalities.actions.read,
				),
			},
			LocationsController.getMunicipalityById,
		);
		// GET /localities
		instance.get(
			'/localities',
			{
				preHandler: authorizationMiddleware<Locality>(
					Permissions.localities.scope,
					Permissions.localities.actions.list,
				),
			},
			LocationsController.getAllLocalities,
		);

		// GET /localities/:id
		instance.get(
			'/localities/:id',
			{
				preHandler: authorizationMiddleware<Locality>(
					Permissions.localities.scope,
					Permissions.localities.actions.read,
				),
			},
			LocationsController.getLocalityById,
		);
		// GET /parishes
		instance.get(
			'/parishes',
			{
				preHandler: authorizationMiddleware<Parish>(
					Permissions.parishes.scope,
					Permissions.parishes.actions.list,
				),
			},
			LocationsController.getAllParishes,
		);

		// GET /parishes/:id
		instance.get(
			'/parishes/:id',
			{
				preHandler: authorizationMiddleware<Parish>(
					Permissions.parishes.scope,
					Permissions.parishes.actions.read,
				),
			},
			LocationsController.getParishById,
		);

		next();
	},
	{ prefix: namespace },
);
