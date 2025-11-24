/* * */

import fastifyWebsocket from '@fastify/websocket';
import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

(async function () {
	//

	const fastifyService = FastifyService.getInstance({
		origin: getAppConfig('controller', 'cors_origin'),
		port: getAppConfig('controller', 'api_port'),
	});

	await fastifyService.server.register(fastifyWebsocket);

	await fastifyService.start();

	//
})();
