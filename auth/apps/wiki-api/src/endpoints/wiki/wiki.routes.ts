/* * */

import { generateWikiMdx } from '@/utils/generate-mdx.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { FastifyInstance } from 'fastify';

import { WikiController } from './wiki.controller.js';

/* * */

const NAMESPACE = '/';

const server: FastifyInstance = FastifyService.getInstance().server;
const controller = new WikiController();

/* * */

server.register(
	(instance, opts, next) => {
		// GET /wiki
		instance.get(
			'/', (request, reply) => {
				return controller.getAll(request, reply);
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
	{ prefix: NAMESPACE },
);
