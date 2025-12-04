/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getAppConfig('performance', 'cors_origin'),
		port: getAppConfig('performance', 'api_port'),
	});

	await fastifyService.start();

	//
})();
