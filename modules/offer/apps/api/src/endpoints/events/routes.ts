/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createEventHandler } from './handlers/create-event.js';
import { deleteEventHandler } from './handlers/delete-event.js';
import { getEventHandler } from './handlers/get-event.js';
import { listEventsHandler } from './handlers/list-events.js';
import { lockEventHandler } from './handlers/lock-event.js';
import { updateEventHandler } from './handlers/update-event.js';

/* * */

const NAMESPACE = '/events';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.read]) },
			listEventsHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.read]) },
			getEventHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.create]) },
			createEventHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.update]) },
			updateEventHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.lock]) },
			lockEventHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.events.scope, [PermissionCatalog.all.events.actions.delete]) },
			deleteEventHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
