/* * */

import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { composeAlertHandler } from './handlers/compose-alert.js';
import { createAlertHandler } from './handlers/create-alert.js';
import { deleteAlertHandler } from './handlers/delete-alert.js';
import { deleteImageHandler } from './handlers/delete-image.js';
import { duplicateAlertHandler } from './handlers/duplicate-alert.js';
import { getAlertHandler } from './handlers/get-alert.js';
import { getImageHandler } from './handlers/get-image.js';
import { listAlertsHandler } from './handlers/list-alerts.js';
import { lockAlertHandler } from './handlers/lock-alert.js';
import { updateAlertHandler } from './handlers/update-alert.js';
import { uploadImageHandler } from './handlers/upload-image.js';

/* * */

const namespace = '/alerts';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			listAlertsHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			getAlertHandler,
		);

		instance.get(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			getImageHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.create]) },
			createAlertHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.update]) },
			updateAlertHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.delete]) },
			deleteAlertHandler,
		);

		instance.post(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.update]) },
			uploadImageHandler,
		);

		instance.delete(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.update]) },
			deleteImageHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.lock]) },
			lockAlertHandler,
		);

		instance.get(
			'/:id/duplicate',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.create]) },
			duplicateAlertHandler,
		);

		instance.post(
			'/compose',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.create]) },
			composeAlertHandler,
		);

		next();
	},
	{ prefix: namespace },
);
