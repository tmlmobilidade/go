/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createOrganizationHandler } from './handlers/create-organization.js';
import { deleteImageHandler } from './handlers/delete-image.js';
import { deleteOrganizationHandler } from './handlers/delete-organization.js';
import { getImageHandler } from './handlers/get-image.js';
import { getOrganizationHandler } from './handlers/get-organization.js';
import { listOrganizationsHandler } from './handlers/list-organizations.js';
import { lockOrganizationHandler } from './handlers/lock-organization.js';
import { updateImageHandler } from './handlers/update-image.js';
import { updateOrganizationHandler } from './handlers/update-organization.js';

/* * */

const NAMESPACE = '/organizations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.read]) },
			listOrganizationsHandler,
		);

		instance.get(
			'/:id/detail',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.read]) },
			getOrganizationHandler,
		);

		instance.get(
			'/:id/detail/image/:theme',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.read]) },
			getImageHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.create]) },
			createOrganizationHandler,
		);

		instance.put(
			'/:id/update',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.update]) },
			updateOrganizationHandler,
		);

		instance.post(
			'/:id/update/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.update]) },
			updateImageHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.lock]) },
			lockOrganizationHandler,
		);

		instance.delete(
			'/:id/delete/image/:theme',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.update]) },
			deleteImageHandler,
		);

		instance.delete(
			'/:id/delete',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.delete]) },
			deleteOrganizationHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
