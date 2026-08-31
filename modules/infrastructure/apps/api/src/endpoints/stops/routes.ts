/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { createStopHandler } from './handlers/create-stop.js';
import { deleteStopHandler } from './handlers/delete-stop.js';
import { getStopHandler } from './handlers/get-stop.js';
import { getTtsHandler } from './handlers/get-tts.js';
import { getValidIdHandler } from './handlers/get-valid-id.js';
import { listStopsHandler } from './handlers/list-stops.js';
import { lockStopHandler } from './handlers/lock-stop.js';
import { updateStopHandler } from './handlers/update-stop.js';

/* * */

const NAMESPACE = '/stops';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', { preHandler: authorizationMiddleware('stops', ['read']) }, listStopsHandler);

		instance.get('/valid-id', { preHandler: authorizationMiddleware('stops', ['read']) }, getValidIdHandler);

		instance.get('/:id', { preHandler: authorizationMiddleware('stops', ['read']) }, getStopHandler);

		instance.post('/', { preHandler: authorizationMiddleware('stops', ['create']) }, createStopHandler);

		instance.put('/:id', { preHandler: authorizationMiddleware('stops', ['update']) }, updateStopHandler);

		instance.get('/tts/:id', { preHandler: authorizationMiddleware('stops', ['read']) }, getTtsHandler);

		instance.get('/:id/lock', { preHandler: authorizationMiddleware('stops', ['lock']) }, lockStopHandler);

		instance.delete('/:id', { preHandler: authorizationMiddleware('stops', ['delete']) }, deleteStopHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
