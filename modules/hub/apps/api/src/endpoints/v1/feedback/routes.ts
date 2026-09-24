/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { postFeedbackHandler, postFeedbackRouteOptions } from './handlers/post-feedback.js';

/* * */

const NAMESPACE = '/v1/feedback';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/', postFeedbackRouteOptions, postFeedbackHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
