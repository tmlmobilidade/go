import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createChangelogHandler } from './handlers/create-changelog.js';
import { deleteChangelogHandler } from './handlers/delete-changelog.js';
import { getChangelogHandler } from './handlers/get-changelog.js';
import { listChangelogsHandler } from './handlers/list-changelogs.js';
import { updateChangelogHandler } from './handlers/update-changelog.js';

/* * */

const NAMESPACE = '/changelogs';
const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.changelogs.scope, [PermissionCatalog.all.changelogs.actions.read]) },
			listChangelogsHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.changelogs.scope, [PermissionCatalog.all.changelogs.actions.read]) },
			getChangelogHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.changelogs.scope, [PermissionCatalog.all.changelogs.actions.update]) },
			createChangelogHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.changelogs.scope, [PermissionCatalog.all.changelogs.actions.update]) },
			updateChangelogHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.changelogs.scope, [PermissionCatalog.all.changelogs.actions.delete]) },
			deleteChangelogHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
