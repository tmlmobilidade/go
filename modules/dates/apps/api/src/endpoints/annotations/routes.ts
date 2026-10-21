/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createAnnotationHandler } from './handlers/create-annotation.js';
import { deleteAnnotationHandler } from './handlers/delete-annotation.js';
import { getAnnotationHandler } from './handlers/get-annotation.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listAnnotationsHandler } from './handlers/list-annotations.js';
import { lockAnnotationHandler } from './handlers/lock-annotation.js';
import { updateAnnotationHandler } from './handlers/update-annotation.js';

/* * */

const NAMESPACE = '/annotations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.read]) },
			listAnnotationsHandler,
		);

		instance.get(
			'/list-agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.read, PermissionCatalog.all.annotations.actions.create]) },
			listAgenciesHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.read]) },
			getAnnotationHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.create]) },
			createAnnotationHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.update]) },
			updateAnnotationHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.lock]) },
			lockAnnotationHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.annotations.scope, [PermissionCatalog.all.annotations.actions.delete]) },
			deleteAnnotationHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
