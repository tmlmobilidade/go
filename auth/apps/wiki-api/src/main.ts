/* * */

import { FastifyService, type FastifyServiceOptions } from '@tmlmobilidade/connectors';
import { getAppConfig } from '@tmlmobilidade/lib';

/* * */

const MAX_BODY_SIZE = 1024 * 1024 * 1024 * 2; // 2GB

/* * */

(async function () {
	//

	const options: FastifyServiceOptions = {
		bodyLimit: MAX_BODY_SIZE,
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
		origin: getAppConfig('auth', 'cors_origin'),
		port: getAppConfig('auth', 'api_port') + 20,
	};

	// Start Fastify server

	const fastifyService = FastifyService.getInstance(options);

	// fastifyService.server.

	await fastifyService.start();

	//
})();
