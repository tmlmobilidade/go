/* * */

import { AnnotationsController } from '@/endpoints/annotations/annotations.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { createAnnotationHandler } from './handlers/create-annotation.js';

/* * */

const NAMESPACE = '/annotations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware('annotations', ['read']) },
			AnnotationsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware('annotations', ['read']) },
			AnnotationsController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware('annotations', ['create']) },
			createAnnotationHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware('annotations', ['update']) },
			AnnotationsController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware('annotations', ['lock']) },
			AnnotationsController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware('annotations', ['delete']) },
			AnnotationsController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
