/* * */

import { MunicipalitiesController } from '@/endpoints/v1/locations/municipalities/municipalities.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/municipalities', MunicipalitiesController.getMunicipalities);
		next();
	},
	{ prefix: '/v1/locations' },
);
