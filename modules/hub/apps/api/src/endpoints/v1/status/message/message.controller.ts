/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

export class MessageController {
	static async getMessage(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return reply
			.code(200)
			.header('cache-control', 'public, max-age=30')
			.send(
				JSON.stringify({
					body: 'Estamos a desenvolver todos os esforços para resolver a situação. Obrigado pela sua compreensão.',
					more_info: 'https://developer.carrismetropolitana.pt/blog/...',
					style: 'warning',
					title: 'Instabilidade temporária no tempo real',
				}),
			);
	}
}
