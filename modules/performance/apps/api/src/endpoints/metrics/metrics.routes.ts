/* * */

import { Permissions } from '@tmlmobilidade/consts';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { Metric } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

import { MetricsController } from './metrics.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/metrics';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /metrics/:id
		instance.get(
			'/:id',
			{
				preHandler: authorizationMiddleware<Metric>(
					Permissions.performance.scope,
					Permissions.performance.actions.read,
				),
			},
			MetricsController.getMetric,
		);

		next();
	},
	{ prefix: namespace },
);
