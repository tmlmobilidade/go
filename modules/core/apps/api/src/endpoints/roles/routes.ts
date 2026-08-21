/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createRoleHandler } from './handlers/create-role.js';
import { deleteRoleHandler } from './handlers/delete-role.js';
import { getRoleHandler } from './handlers/get-role.js';
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
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.read]) },
			listRolesHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.read]) },
			getRoleHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.create]) },
			createRoleHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.update]) },
			updateRoleHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.delete]) },
			deleteRoleHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.roles.scope, [PermissionCatalog.all.roles.actions.lock]) },
			lockRoleHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
