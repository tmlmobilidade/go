/* * */

import { type ExtendedFastifyServiceOptions, FastifyService } from '@tmlmobilidade/connectors';

/* * */

const MAX_BODY_SIZE = 1024 * 1024 * 10; // 10MB

async function main() {
	//

	const origin
		= process.env.NODE_ENV === 'development'
			? '*'
			: `https://*.${process.env.COOKIE_DOMAIN}`;

	const options: ExtendedFastifyServiceOptions = {
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
		origin: origin,
	};

	// Start Fastify server
	const fastifyService = FastifyService.getInstance(options);

	await fastifyService.start();
}

main();
