/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		module: 'performance',
		origin: getModuleConfig('performance', 'cors_origin'),
		port: getModuleConfig('performance', 'api_port'),
	});

	await fastifyService.start();

	//
})();
