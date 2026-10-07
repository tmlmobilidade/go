/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { composeAlertHandler } from './handlers/compose-alert.js';
import { createAlertHandler } from './handlers/create-alert.js';
import { deleteAlertHandler } from './handlers/delete-alert.js';
import { deleteImageHandler } from './handlers/delete-image.js';
import { duplicateAlertHandler } from './handlers/duplicate-alert.js';
import { getAlertHandler } from './handlers/get-alert.js';
import { getImageHandler } from './handlers/get-image.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listAlertsHandler } from './handlers/list-alerts.js';
import { listLines } from './handlers/list-lines.js';
import { listRides } from './handlers/list-rides.js';
import { listStops } from './handlers/list-stops.js';
import { lockAlertHandler } from './handlers/lock-alert.js';
import { updateAlertHandler } from './handlers/update-alert.js';
import { updateImageHandler } from './handlers/update-image.js';

/* * */

const namespace = '/alerts';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware('alerts', ['read']) },
			listAlertsHandler,
		);

		instance.post(
			'/list-agencies',
			{ preHandler: authorizationMiddleware('alerts', ['read', 'create']) },
			listAgenciesHandler,
		);

		instance.post(
			'/list-lines',
			{ preHandler: authorizationMiddleware('alerts', ['read', 'create']) },
			listLines,
		);

		instance.post(
			'/list-rides',
			{ preHandler: authorizationMiddleware('alerts', ['read', 'create']) },
			listRides,
		);

		instance.post(
			'/list-stops',
			{ preHandler: authorizationMiddleware('alerts', ['read', 'create']) },
			listStops,
		);

		instance.get('/:id/detail',
			{ preHandler: authorizationMiddleware('alerts', ['read']) },
			getAlertHandler,
		);

		instance.get(
			'/:id/detail/image',
			{ preHandler: authorizationMiddleware('alerts', ['read']) },
			getImageHandler,
		);

		instance.post(
			'/:id/update/image',
			{ preHandler: authorizationMiddleware('alerts', ['update']) },
			updateImageHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware('alerts', ['create']) },
			createAlertHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware('alerts', ['update']) },
			updateAlertHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware('alerts', ['delete']) },
			deleteAlertHandler,
		);

		instance.delete(
			'/:id/image',
			{ preHandler: authorizationMiddleware('alerts', ['update']) },
			deleteImageHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware('alerts', ['lock']) },
			lockAlertHandler,
		);

		instance.post(
			'/:id/duplicate',
			{ preHandler: authorizationMiddleware('alerts', ['create']) },
			duplicateAlertHandler,
		);

		instance.post(
			'/compose',
			{ preHandler: authorizationMiddleware('alerts', ['create']) },
			composeAlertHandler,
		);

		next();
	},
	{ prefix: namespace },
);
