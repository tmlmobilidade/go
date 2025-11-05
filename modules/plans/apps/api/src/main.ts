/* * */

import fastifyMultipart from '@fastify/multipart';
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
		origin: getAppConfig('plans', 'cors_origin'),
		port: getAppConfig('plans', 'api_port'),
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
