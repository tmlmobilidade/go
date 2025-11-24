/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getAppConfig('exporter', 'cors_origin'),
		port: getAppConfig('exporter', 'api_port'),
	});

	await fastifyService.start();

	//
})();
