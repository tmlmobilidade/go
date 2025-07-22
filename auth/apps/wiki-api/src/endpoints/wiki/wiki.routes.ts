/* * */

import { generateWikiMdx } from '@/utils/generate-mdx.js';
import { transformMdxToHtml } from '@/utils/transform-mdx-to-html.js';
import { FastifyService } from '@tmlmobilidade/connectors';

import { WikiController } from './wiki.controller.js';

/* * */

const server = FastifyService.getInstance().server;
const NAMESPACE = '/wiki';
const controller = new WikiController();

/* * */

server.register(
	(instance, opts, next) => {
		// GET /wiki
		instance.get('/', async (request, reply) => {
			const result = await transformMdxToHtml();
			return reply.send(result);
		});

		// GET /wiki:id
		instance.get('wiki/:id', (request, reply) => {
			return reply.send(generateWikiMdx);
		});

		next();
	},
	{ prefix: NAMESPACE },
);
