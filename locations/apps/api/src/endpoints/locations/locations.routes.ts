/* * */

import { FastifyService } from '@tmlmobilidade/connectors';

import { LocationsController } from './locations.controller.js';

/* * */

const server = FastifyService.getInstance().server;
const namespace = '/';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /
		instance.get('/coordinates', LocationsController.findByCoordinates);

		next();
	},
	{ prefix: namespace },
);
