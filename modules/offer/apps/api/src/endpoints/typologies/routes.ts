/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createTypologyHandler } from './handlers/create-typology.js';
import { deleteTypologyHandler } from './handlers/delete-typology.js';
import { getTypologyHandler } from './handlers/get-typology.js';
import { listAgenciesHandler } from './handlers/list-agencies.js';
import { listFaresHandler } from './handlers/list-fares.js';
import { listTypologiesHandler } from './handlers/list-typologies.js';
import { lockTypologyHandler } from './handlers/lock-typology.js';
import { updateTypologyHandler } from './handlers/update-typology.js';

/* * */

const NAMESPACE = '/typologies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.typologies.actions.nav], scope: PermissionCatalog.all.typologies.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			listTypologiesHandler,
		);

		instance.get(
			'/list-agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.nav, PermissionCatalog.all.typologies.actions.create, PermissionCatalog.all.typologies.actions.update]) },
			listAgenciesHandler,
		);

		instance.get(
			'/list-fares',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.nav, PermissionCatalog.all.typologies.actions.update]) },
			listFaresHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.typologies.actions.nav], scope: PermissionCatalog.all.typologies.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			getTypologyHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.create]) },
			createTypologyHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.update]) },
			updateTypologyHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.lock]) },
			lockTypologyHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.delete]) },
			deleteTypologyHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
