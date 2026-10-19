/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createFareHandler } from './handlers/create-fare.js';
import { deleteFareHandler } from './handlers/delete-fare.js';
import { getFareHandler } from './handlers/get-fare.js';
import { listFaresHandler } from './handlers/list-fares.js';
import { lockFareHandler } from './handlers/lock-fare.js';
import { updateFareHandler } from './handlers/update-fare.js';

/* * */

const NAMESPACE = '/fares';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.fares.actions.nav], scope: PermissionCatalog.all.fares.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			listFaresHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.fares.actions.nav], scope: PermissionCatalog.all.fares.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			getFareHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.create]) },
			createFareHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.update]) },
			updateFareHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.lock]) },
			lockFareHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.delete]) },
			deleteFareHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
