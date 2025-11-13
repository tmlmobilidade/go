/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { Permissions } from '@tmlmobilidade/consts';
import { SimplifiedApexValidation } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { NetworkController } from './network.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

/* * */

server.register(
	(instance, opts, next) => {
		instance.get(
			'/lines',
			{
				preHandler: authorizationMiddleware<SimplifiedApexValidation>(
					Permissions.performance.scope,
					Permissions.performance.actions.read,
				),
			},
			NetworkController.getLines,
		);

		instance.get(
			'/patterns',
			{
				preHandler: authorizationMiddleware<SimplifiedApexValidation>(
					Permissions.performance.scope,
					Permissions.performance.actions.read,
				),
			},
			NetworkController.getPatterns,
		);

		next();
	},
);
