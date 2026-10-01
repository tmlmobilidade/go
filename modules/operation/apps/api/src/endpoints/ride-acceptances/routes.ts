/* * */

import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { addComment } from './handlers/add-comment.js';
import { changeStatus } from './handlers/change-status.js';
import { getRideAcceptance } from './handlers/get-ride-acceptance.js';
import { justifyRide } from './handlers/justify-ride.js';
import { lockRideAcceptance } from './handlers/lock-ride-acceptance.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/ride-acceptances/:id';

/* * */

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', { preHandler: authorizationMiddleware('rides', ['acceptance_read']) }, getRideAcceptance);

		instance.put('/change-status', { preHandler: authorizationMiddleware('rides', ['acceptance_change_status']) }, changeStatus);

		instance.put('/justify', { preHandler: authorizationMiddleware('rides', ['acceptance_justify']) }, justifyRide);

		instance.post('/comment', { preHandler: authorizationMiddleware('rides', ['acceptance_justify', 'acceptance_change_status']) }, addComment);

		instance.put('/lock', { preHandler: authorizationMiddleware('rides', ['acceptance_lock']) }, lockRideAcceptance);

		next();
	},
	{ prefix: namespace },
);
