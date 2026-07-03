/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		module: 'exporter',
		origin: getModuleConfig('exporter', 'cors_origin'),
		port: getModuleConfig('exporter', 'api_port'),
	});

	await fastifyService.start();

	//
})();
