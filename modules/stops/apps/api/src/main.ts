/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getAppConfig('stops', 'cors_origin'),
		port: getAppConfig('stops', 'api_port'),
	});

	await fastifyService.start();

	//
})();
