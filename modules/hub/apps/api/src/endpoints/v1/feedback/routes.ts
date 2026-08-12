/* * */

import { postFeedback, postFeedbackRouteOptions } from '@/endpoints/v1/feedback/controllers/post-feedback.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/feedback';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/', postFeedbackRouteOptions, postFeedback);

		next();
	},
	{ prefix: namespace },
);
