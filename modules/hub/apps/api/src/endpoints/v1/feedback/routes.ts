/* * */

import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

import { submitFeedback } from './controllers/submit-feedback.js';

/* * */

const namespace = '/v1/feedback';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/', submitFeedback);

		next();
	},
	{ prefix: namespace },
);
