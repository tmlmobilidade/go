/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createUserHandler } from './handlers/create-user.js';
import { deleteUserHandler } from './handlers/delete-user.js';
import { getUserSimplifiedHandler } from './handlers/get-user-simplified.js';
import { getUserHandler } from './handlers/get-user.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listMunicipalitiesHandler } from './handlers/list-municipalities.js';
import { listOrganizationsHandler } from './handlers/list-organizations.js';
import { listRolesHandler } from './handlers/list-roles.js';
import { listUsersHandler } from './handlers/list-users.js';
import { lockUserHandler } from './handlers/lock-user.js';
import { updateUserHandler } from './handlers/update-user.js';

/* * */

const NAMESPACE = '/users';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/list',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.read]) },
			listUsersHandler,
		);

		instance.get(
			'/list-agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.read, PermissionCatalog.all.users.actions.create]) },
			listAgenciesHandler,
		);

		instance.get(
			'/list-municipalities',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.read, PermissionCatalog.all.users.actions.create]) },
			listMunicipalitiesHandler,
		);

		instance.get(
			'/list-roles',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.read, PermissionCatalog.all.users.actions.create]) },
			listRolesHandler,
		);

		instance.get(
			'/list-organizations',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.read, PermissionCatalog.all.users.actions.create]) },
			listOrganizationsHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.read]) },
			getUserHandler,
		);

		instance.get(
			'/:id/simplified',
			{ preHandler: authorizationMiddleware() },
			getUserSimplifiedHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.create]) },
			createUserHandler,
		);

		instance.put(
			'/update/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.update]) },
			updateUserHandler,
		);

		instance.get(
			'/lock/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.lock]) },
			lockUserHandler,
		);

		instance.delete(
			'/delete/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.users.scope, [PermissionCatalog.all.users.actions.delete]) },
			deleteUserHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
