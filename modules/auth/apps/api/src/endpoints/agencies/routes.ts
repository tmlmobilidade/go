/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { getAgencyHandler } from './handlers/get-agency.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { lockAgencyHandler } from './handlers/lock-agency.js';
import { updateAgencyHandler } from './handlers/update-agency.js';

/* * */

const NAMESPACE = '/agencies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', listAgenciesHandler);

		instance.get('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, [PermissionCatalog.all.agencies.actions.read]) }, getAgencyHandler);

		instance.put('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, [PermissionCatalog.all.agencies.actions.update]) }, updateAgencyHandler);

		instance.get('/:id/lock', { preHandler: authorizationMiddleware(PermissionCatalog.all.agencies.scope, [PermissionCatalog.all.agencies.actions.lock]) }, lockAgencyHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
