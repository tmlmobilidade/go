/* * */

import { FastifyService, type FastifyServiceOptions } from '@go/connectors-fastify';
import { getAppConfig } from '@go/lib';

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
		origin: getAppConfig('stops', 'cors_origin'),
		port: getAppConfig('stops', 'api_port'),
	};

	// Start Fastify server

	const fastifyService = FastifyService.getInstance(options);

	await fastifyService.start();

	//
})();
