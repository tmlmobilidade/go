import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createChangelogReleaseHandler } from './handlers/create-changelog-release.js';
import { getChangelogReleaseHandler } from './handlers/get-changelog-release.js';
import { listChangelogReleasesHandler } from './handlers/list-changelog-releases.js';
import { updateChangelogReleaseHandler } from './handlers/update-changelog-release.js';

/* * */

const NAMESPACE = '/changelog-releases';
const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.changelogs.scope, [PermissionCatalog.all.changelogs.actions.read]) },
			listChangelogReleasesHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.changelogs.scope, [PermissionCatalog.all.changelogs.actions.read]) },
			getChangelogReleaseHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.changelogs.scope, [PermissionCatalog.all.changelogs.actions.update]) },
			createChangelogReleaseHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.changelogs.scope, [PermissionCatalog.all.changelogs.actions.update]) },
			updateChangelogReleaseHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
