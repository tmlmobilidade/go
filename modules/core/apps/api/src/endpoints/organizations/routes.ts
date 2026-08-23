/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { createOrganizationHandler } from './handlers/create-organization.js';
import { deleteImageHandler } from './handlers/delete-image.js';
import { deleteOrganizationHandler } from './handlers/delete-organization.js';
import { getImageHandler } from './handlers/get-image.js';
import { getOrganizationHandler } from './handlers/get-organization.js';
import { listOrganizationsHandler } from './handlers/list-organizations.js';
import { lockOrganizationHandler } from './handlers/lock-organization.js';
import { updateOrganizationHandler } from './handlers/update-organization.js';
import { uploadImageHandler } from './handlers/upload-image.js';

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
			'/detail/:id',
			{ preHandler: authorizationMiddleware('organizations', ['read']) },
			getOrganizationHandler,
		);

		instance.put(
			'/update/:id',
			{ preHandler: authorizationMiddleware('organizations', ['update']) },
			updateOrganizationHandler,
		);

		instance.post(
			'/update/:id/image',
			{ preHandler: authorizationMiddleware('organizations', ['update']) },
			uploadImageHandler,
		);

		instance.get(
			'/detail/:id/image',
			{ preHandler: authorizationMiddleware('organizations', ['read']) },
			getImageHandler,
		);

		instance.delete(
			'/delete/:id/:theme/image',
			{ preHandler: authorizationMiddleware('organizations', ['delete']) },
			deleteImageHandler,
		);

		instance.get(
			'/lock/:id',
			{ preHandler: authorizationMiddleware('organizations', ['lock']) },
			lockOrganizationHandler,
		);

		instance.delete(
			'/delete/:id',
			{ preHandler: authorizationMiddleware('organizations', ['delete']) },
			deleteOrganizationHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
