/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createZoneHandler } from './handlers/create-zone.js';
import { deleteZoneHandler } from './handlers/delete-zone.js';
import { getZoneHandler } from './handlers/get-zone.js';
import { listZonesHandler } from './handlers/list-zones.js';
import { lockZoneHandler } from './handlers/lock-zone.js';
import { updateZoneHandler } from './handlers/update-zone.js';

/* * */

const NAMESPACE = '/zones';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.zones.actions.nav], scope: PermissionCatalog.all.zones.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			listZonesHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.zones.actions.nav], scope: PermissionCatalog.all.zones.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			getZoneHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.create]) },
			createZoneHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.update]) },
			updateZoneHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.lock]) },
			lockZoneHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.zones.scope, [PermissionCatalog.all.zones.actions.delete]) },
			deleteZoneHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
