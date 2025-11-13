/* * */

import fastifyMultipart from '@fastify/multipart';
import { FastifyService, type FastifyServiceOptions } from '@tmlmobilidade/fastify';
import { getAppConfig } from '@tmlmobilidade/consts';

/* * */

const MAX_BODY_SIZE = 1024 * 1024 * 10; // 10MB

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
		origin: getAppConfig('auth', 'cors_origin'),
		port: getAppConfig('auth', 'api_port'),
		routerOptions: {
			ignoreTrailingSlash: true,
		},
	};

	// Start Fastify server

	const fastifyService = FastifyService.getInstance(options);

	await fastifyService.server.register(fastifyMultipart, {
		limits: {
			fileSize: MAX_BODY_SIZE,
		},
	});

	await fastifyService.start();

	//
})();
