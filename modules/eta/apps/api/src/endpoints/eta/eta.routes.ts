/* * */

import { EtaController } from '@/endpoints/eta/eta.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/eta';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			EtaController.getAll,
		);

		instance.get(
			'/:tripId',
			EtaController.getByTripId,
		);

		instance.get(
			'/by_stop/:stopId',
			EtaController.getByStopId,
		);

		instance.get(
			'/by_pattern/:patternId',
			EtaController.getByPatternId,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
