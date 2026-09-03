/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

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

		instance.get('/list', { preHandler: authorizationMiddleware('roles', ['read']) }, listRolesHandler);

		instance.get('/list-agencies', { preHandler: authorizationMiddleware('roles', ['read', 'create']) }, listAgenciesHandler);

		instance.get('/list-municipalities', { preHandler: authorizationMiddleware('roles', ['read', 'create']) }, listMunicipalitiesHandler);

		instance.get('/:id', { preHandler: authorizationMiddleware('roles', ['read']) }, getRoleHandler);

		instance.post('/create', { preHandler: authorizationMiddleware('roles', ['create']) }, createRoleHandler);

		instance.put('/update/:id', { preHandler: authorizationMiddleware('roles', ['update']) }, updateRoleHandler);

		instance.delete('/delete/:id', { preHandler: authorizationMiddleware('roles', ['delete']) }, deleteRoleHandler);

		instance.get('/lock/:id', { preHandler: authorizationMiddleware('roles', ['lock']) }, lockRoleHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
