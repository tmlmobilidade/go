/* * */

import { NotificationsController } from '@/endpoints/notifications/notifications.controller.js';
import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/notifications';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		// GET /notifications
		instance.get('/', { preHandler: authorizationMiddleware() }, NotificationsController.getAll);

		// GET /notifications/:id
		instance.get('/:id', { preHandler: authorizationMiddleware() }, NotificationsController.getById);

		// GET /notifications/:id/mark-as-read
		instance.get('/:id/mark-as-read', { preHandler: authorizationMiddleware() }, NotificationsController.markAsRead);

		// Delete /notifications/:id
		instance.delete('/:id', { preHandler: authorizationMiddleware() }, NotificationsController.delete);
		next();
	},
	{ prefix: NAMESPACE },
);
