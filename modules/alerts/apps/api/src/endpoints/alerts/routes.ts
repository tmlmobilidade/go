/* * */

import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

import { create } from './controllers/create.js';
import { deleteImage } from './controllers/delete-image.js';
import { deleteAlert } from './controllers/delete.js';
import { describe } from './controllers/describe.js';
import { duplicate } from './controllers/duplicate.js';
import { getById } from './controllers/get-by-id.js';
import { getImage } from './controllers/get-image.js';
import { listAlerts } from './controllers/list-alerts.js';
import { lock } from './controllers/lock.js';
import { update } from './controllers/update.js';
import { uploadImage } from './controllers/upload-image.js';

/* * */

const namespace = '/alerts';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			listAlerts,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			getById,
		);

		instance.get(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.read]) },
			getImage,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.create]) },
			create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.update]) },
			update,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.delete]) },
			deleteAlert,
		);

		instance.post(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.update]) },
			uploadImage,
		);

		instance.delete(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.update]) },
			deleteImage,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.lock]) },
			lock,
		);

		instance.get(
			'/:id/duplicate',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.create]) },
			duplicate,
		);

		instance.post(
			'/describe',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.alerts.scope, [PermissionCatalog.all.alerts.actions.create]) },
			describe,
		);

		next();
	},
	{ prefix: namespace },
);
