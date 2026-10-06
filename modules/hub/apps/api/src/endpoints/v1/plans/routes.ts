/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getApprovedPlansHandler } from './handlers/get-approved-plans.js';
import { getGtfsHandler } from './handlers/get-gtfs.js';

/* * */

const NAMESPACE = '/v1/plans';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', getApprovedPlansHandler);

		instance.get('/gtfs/:organizationShortName', getGtfsHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
