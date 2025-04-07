/* * */

import FastifyService from '@/services/fastify.service.js';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { FastifyServerOptions } from 'fastify';

/* * */

const options: FastifyServerOptions = {
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
};

async function main() {
	// Start Fastify server
	const fastifyService = FastifyService.getInstance(options);
	await fastifyService.server.register(cookie);
	const origin
		= process.env.NODE_ENV === 'development'
			? /^http:\/\/localhost:\d{1,5}$/
			: new RegExp(`https://.*\\.${process.env.COOKIE_DOMAIN}$`);

	await fastifyService.server.register(cors, {
		credentials: true,
		methods: ['GET', 'PUT', 'POST', 'DELETE'],
		origin,
	});
	await fastifyService.start();
}

main();
