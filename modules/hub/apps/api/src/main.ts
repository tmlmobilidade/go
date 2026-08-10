/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		module: 'hub',
		origin: getModuleConfig('hub', 'cors_origin'),
		port: getModuleConfig('hub', 'api_port'),
	});

	await fastifyService.start();

	//
})();
