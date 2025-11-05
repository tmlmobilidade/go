/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/go-lib';
import { Metric } from '@tmlmobilidade/go-types';
import { FastifyInstance } from 'fastify';

import { MetricsController } from './metrics.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/metrics';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /metrics/:metricName
		instance.get(
			'/:metricName',
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
