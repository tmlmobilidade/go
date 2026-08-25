/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { createOrganizationHandler } from './handlers/create-organization.js';
import { deleteImageHandler } from './handlers/delete-image.js';
import { deleteOrganizationHandler } from './handlers/delete-organization.js';
import { getImageHandler } from './handlers/get-image.js';
import { getOrganizationHandler } from './handlers/get-organization.js';
import { listOrganizationsHandler } from './handlers/list-organizations.js';
import { lockOrganizationHandler } from './handlers/lock-organization.js';
import { updateImageHandler } from './handlers/update-image.js';
import { updateOrganizationHandler } from './handlers/update-organization.js';

/* * */

const NAMESPACE = '/organizations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/list',
			{ preHandler: authorizationMiddleware('organizations', ['read']) },
			listOrganizationsHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware('organizations', ['create']) },
			createOrganizationHandler,
		);

		instance.get(
			'/:id/detail',
			{ preHandler: authorizationMiddleware('organizations', ['read']) },
			getOrganizationHandler,
		);

		instance.put(
			'/:id/update',
			{ preHandler: authorizationMiddleware('organizations', ['update']) },
			updateOrganizationHandler,
		);

		instance.post(
			'/:id/update/image',
			{ preHandler: authorizationMiddleware('organizations', ['update']) },
			updateImageHandler,
		);

		instance.get(
			'/:id/detail/image/:theme',
			{ preHandler: authorizationMiddleware('organizations', ['read']) },
			getImageHandler,
		);

		instance.delete(
			'/:id/delete/image/:theme',
			{ preHandler: authorizationMiddleware('organizations', ['update']) },
			deleteImageHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware('organizations', ['lock']) },
			lockOrganizationHandler,
		);

		instance.delete(
			'/:id/delete',
			{ preHandler: authorizationMiddleware('organizations', ['delete']) },
			deleteOrganizationHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
