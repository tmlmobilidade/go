/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { createStopHandler } from './handlers/create-stop.js';
import { deleteStopHandler } from './handlers/delete-stop.js';
import { getStopHandler } from './handlers/get-stop.js';
import { getTtsHandler } from './handlers/get-tts.js';
import { getValidIdHandler } from './handlers/get-valid-id.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listMunicipalitiesHandler } from './handlers/list-municipalities.js';
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

		instance.get('/list', { preHandler: authorizationMiddleware('stops', ['read']) }, listStopsHandler);

		instance.post('/list-agencies', { preHandler: authorizationMiddleware('stops', ['read']) }, listAgenciesHandler);

		instance.post('/list-municipalities', { preHandler: authorizationMiddleware('stops', ['read']) }, listMunicipalitiesHandler);

		instance.get('/get/valid-id', { preHandler: authorizationMiddleware('stops', ['read']) }, getValidIdHandler);

		instance.get('/get/:id', { preHandler: authorizationMiddleware('stops', ['read']) }, getStopHandler);

		instance.post('/create', { preHandler: authorizationMiddleware('stops', ['create']) }, createStopHandler);

		instance.put('/update/:id', { preHandler: authorizationMiddleware('stops', ['update']) }, updateStopHandler);

		instance.get('/get/tts/:id', { preHandler: authorizationMiddleware('stops', ['read']) }, getTtsHandler);

		instance.get('/lock/:id', { preHandler: authorizationMiddleware('stops', ['lock']) }, lockStopHandler);

		instance.delete('/delete/:id', { preHandler: authorizationMiddleware('stops', ['delete']) }, deleteStopHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
