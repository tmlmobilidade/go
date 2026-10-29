import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createBannerHandler } from './handlers/create-banner.js';
import { getBannerHandler } from './handlers/get-banner.js';
import { listBannersHandler } from './handlers/list-banners.js';
import { updateBannerHandler } from './handlers/update-banner.js';

/* * */

const NAMESPACE = '/banners';
const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.banners.scope, [PermissionCatalog.all.banners.actions.read]) },
			listBannersHandler,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.banners.scope, [PermissionCatalog.all.banners.actions.read]) },
			getBannerHandler,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.banners.scope, [PermissionCatalog.all.banners.actions.update]) },
			createBannerHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.banners.scope, [PermissionCatalog.all.banners.actions.update]) },
			updateBannerHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
