/* * */

import { generateWikiMdx } from '@/utils/generate-mdx.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { FastifyInstance } from 'fastify';
/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/wiki';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /wiki
		instance.get(
			'/', (request, response) => {
				response.send('hey');
			},
		);

		// GET /wiki:id
		instance.get(
			'/:id',
			(request, reply) => {
				reply.send(generateWikiMdx);
			},
		);

		next();
	},
	{ prefix: namespace },
);
