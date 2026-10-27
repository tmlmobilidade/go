import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createOperationalBannerHandler } from './handlers/create-operational-banner.js';
import { getOperationalBannerHandler } from './handlers/get-operational-banner.js';
import { listOperationalBannersHandler } from './handlers/list-operational-banners.js';
import { updateOperationalBannerHandler } from './handlers/update-operational-banner.js';

/* * */

const NAMESPACE = '/operational-banners';
const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.banners.scope, [PermissionCatalog.all.banners.actions.read]) },
			listOperationalBannersHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.banners.scope, [PermissionCatalog.all.banners.actions.read]) },
			getOperationalBannerHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.banners.scope, [PermissionCatalog.all.banners.actions.update]) },
			createOperationalBannerHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.banners.scope, [PermissionCatalog.all.banners.actions.update]) },
			updateOperationalBannerHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
