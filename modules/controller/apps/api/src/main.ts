/* * */

import fastifyWs from '@fastify/websocket';
import { getAppConfig } from '@go/consts';
import { FastifyService, type FastifyServiceOptions } from '@tmlmobilidade/connectors';

/* * */

(async function () {
	//

	const options: FastifyServiceOptions = {
		ignoreTrailingSlash: true,
		logger: {
			level: 'debug',
			transport: {
				options: {
					colorize: true,
				},
				target: 'pino-pretty',
			},
		},
		origin: getAppConfig('controller', 'cors_origin'),
		port: getAppConfig('controller', 'api_port'),
	};

	// Start Fastify server

	const fastifyService = FastifyService.getInstance(options);

	await fastifyService.server.register(fastifyWs);

	await fastifyService.start();

	//
})();
