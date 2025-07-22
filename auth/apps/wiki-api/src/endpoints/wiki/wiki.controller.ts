/* * */

import { transformMdxToHtml } from '@/utils/transform-mdx-to-html.js';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/connectors';
import { HttpStatus } from '@tmlmobilidade/lib';

/* * */

export class WikiController {
	async getAll(request: FastifyRequest, reply: FastifyReply) {
		console.log('------>', request);
		try {
			reply.send(await transformMdxToHtml());
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
