/* * */

import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

import { getReasons } from './controllers/get-reasons.js';
import { submitFeedback } from './controllers/submit-feedback.js';

/* * */

const namespace = '/v1/feedback';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/reasons', getReasons);

		instance.post('/', submitFeedback);

		next();
	},
	{ prefix: namespace },
);
