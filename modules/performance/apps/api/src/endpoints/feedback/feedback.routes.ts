/* * */

import { FeedbackController } from '@/endpoints/feedback/feedback.controller.js';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/feedback';
const shouldAuthenticatePreview = process.env.ENVIRONMENT !== 'dev';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/preview',
			shouldAuthenticatePreview ? { preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) } : {},
			FeedbackController.getPreview,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
