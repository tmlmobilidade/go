/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createRoleHandler } from './handlers/create-role.js';
import { deleteRoleHandler } from './handlers/delete-role.js';
import { getRoleHandler } from './handlers/get-role.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listMunicipalitiesHandler } from './handlers/list-municipalities.js';
import { listRolesHandler } from './handlers/list-roles.js';
import { lockRoleHandler } from './handlers/lock-role.js';
import { updateRoleHandler } from './handlers/update-role.js';

/* * */

const NAMESPACE = '/roles';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.read]) },
			listRolesHandler,
		);

		instance.get(
			'/list-agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.read, PermissionCatalog.all.roles.actions.create]) },
			listAgenciesHandler,
		);

		instance.get(
			'/list-municipalities',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.read, PermissionCatalog.all.roles.actions.create]) },
			listMunicipalitiesHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.read]) },
			getRoleHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.create]) },
			createRoleHandler,
		);

		instance.put(
			'/update/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.update]) },
			updateRoleHandler,
		);

		instance.get(
			'/lock/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.lock]) },
			lockRoleHandler,
		);

		instance.delete(
			'/delete/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.delete]) },
			deleteRoleHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
