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
import { updateOrganizationHandler } from './handlers/update-organization.js';
import { uploadImageHandler } from './handlers/upload-image.js';

/* * */

const NAMESPACE = '/organizations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/list',
			{ preHandler: authorizationMiddleware() },
			listOrganizationsHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.create]) },
			createOrganizationHandler,
		);

		instance.get(
			'/detail/:id',
			{ preHandler: authorizationMiddleware() },
			getOrganizationHandler,
		);

		instance.put(
			'/update/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.update]) },
			updateOrganizationHandler,
		);

		instance.post(
			'/update/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.update]) },
			uploadImageHandler,
		);

		instance.get(
			'/detail/:id/image',
			{ preHandler: authorizationMiddleware() },
			getImageHandler,
		);

		instance.delete(
			'/delete/:id/:theme/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.delete]) },
			deleteImageHandler,
		);

		instance.get(
			'/lock/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.lock]) },
			lockOrganizationHandler,
		);

		instance.delete(
			'/delete/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.delete]) },
			deleteOrganizationHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
