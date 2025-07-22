/* * */

import { generateWikiMdx } from '@/utils/generate-mdx.js';
import { transformMdxToHtml } from '@/utils/transform-mdx-to-html.js';
import { FastifyService } from '@tmlmobilidade/connectors';

/* * */

const server = FastifyService.getInstance().server;
const NAMESPACE = '/wiki';

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
