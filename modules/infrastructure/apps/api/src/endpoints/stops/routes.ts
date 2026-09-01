/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { createStopHandler } from './handlers/create-stop.js';
import { deleteStopHandler } from './handlers/delete-stop.js';
import { getStopHandler } from './handlers/get-stop.js';
import { getTtsHandler } from './handlers/get-tts.js';
import { getValidIdHandler } from './handlers/get-valid-id.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listLocationsHandler } from './handlers/list-locations.js';
import { listStopsHandler } from './handlers/list-stops.js';
import { lockStopHandler } from './handlers/lock-stop.js';
import { updateStopCoordinatesHandler } from './handlers/update-stop-coordinates.js';
import { updateStopNameHandler } from './handlers/update-stop-name.js';
import { updateStopHandler } from './handlers/update-stop.js';

/* * */

const NAMESPACE = '/stops';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/list', { preHandler: authorizationMiddleware('stops', ['read']) }, listStopsHandler);

		instance.post('/list-agencies', { preHandler: authorizationMiddleware('stops', ['read']) }, listAgenciesHandler);

		instance.post('/list-locations', { preHandler: authorizationMiddleware('stops', ['read']) }, listLocationsHandler);

		instance.get('/get/valid-id', { preHandler: authorizationMiddleware('stops', ['read']) }, getValidIdHandler);

		instance.get('/get/:id', { preHandler: authorizationMiddleware('stops', ['read']) }, getStopHandler);

		instance.post('/create', { preHandler: authorizationMiddleware('stops', ['create']) }, createStopHandler);

		instance.put('/update/:id', { preHandler: authorizationMiddleware('stops', ['update']) }, updateStopHandler);

		instance.put('/update-name/:id', { preHandler: authorizationMiddleware('stops', ['edit_name']) }, updateStopNameHandler);

		instance.put('/update-coordinates/:id', { preHandler: authorizationMiddleware('stops', ['edit_coordinates']) }, updateStopCoordinatesHandler);

		instance.get('/get/tts/:id', { preHandler: authorizationMiddleware('stops', ['read']) }, getTtsHandler);

		instance.get('/lock/:id', { preHandler: authorizationMiddleware('stops', ['lock']) }, lockStopHandler);

		instance.delete('/delete/:id', { preHandler: authorizationMiddleware('stops', ['delete']) }, deleteStopHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
