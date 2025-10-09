/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { Alert } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { AlertsController } from './metrics.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/metrics';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /metrics
		instance.get(
			'/',
			{
				preHandler: authorizationMiddleware<Alert>(
					Permissions.performance.scope,
					Permissions.performance.actions.read,
				),
			},
			AlertsController.getAll,
		);

		next();
	},
	{ prefix: namespace },
);
