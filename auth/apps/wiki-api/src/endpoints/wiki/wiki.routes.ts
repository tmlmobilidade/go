/* * */

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
		instance.get('/:id', async (request, reply) => {
			const { id } = request.params as { id: string };

			const result = await transformMdxToHtml();
			const res = result.find(item => item._id === id);

			return reply.send(res);
		});

		next();
	},
	{ prefix: NAMESPACE },
);
