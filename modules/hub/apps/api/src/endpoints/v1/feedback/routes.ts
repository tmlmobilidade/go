/* * */

import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

import { FeedbackController } from './feedback.controller.js';

/* * */

const namespace = '/v1/feedback';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/reasons', FeedbackController.getReasons);

		instance.post('/', FeedbackController.submit);

		next();
	},
	{ prefix: namespace },
);
