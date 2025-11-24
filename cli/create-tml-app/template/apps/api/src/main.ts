/* * */

import { getAppConfig } from '@tmlmobilidade/consts';
import { FastifyService, type FastifyServiceOptions } from '@tmlmobilidade/fastify';

/* * */

const MAX_BODY_SIZE = 1024 * 1024 * 1024 * 2; // 2GB

/* * */

(async function () {
	//

	const options: FastifyServiceOptions = {
		bodyLimit: MAX_BODY_SIZE,
		logger: {
			level: 'debug',
			transport: {
				options: {
					colorize: true,
				},
				target: 'pino-pretty',
			},
		},
		origin: getAppConfig('alerts', 'cors_origin'),
		port: getAppConfig('alerts', 'api_port'),
		routerOptions: {
			ignoreTrailingSlash: true,
		},
	};

	// Start Fastify server

	const fastifyService = FastifyService.getInstance(options);

	await fastifyService.start();

	//
})();
