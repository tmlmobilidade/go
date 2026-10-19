/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getApprovedPlansHandler } from './handlers/get-approved-plans.js';
import { getGtfsCmHandler } from './handlers/get-gtfs-cm.js';
import { getGtfsHandler } from './handlers/get-gtfs.js';

/* * */

const NAMESPACE = '/v1/plans';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', getApprovedPlansHandler);

		instance.get('/gtfs', getGtfsHandler);

		instance.get('/gtfs/cm', getGtfsCmHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
