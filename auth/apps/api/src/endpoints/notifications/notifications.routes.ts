/* * */

import { FastifyService } from '@tmlmobilidade/connectors';

import { NotificationsController } from './notifications.controller.js';

/* * */

const NAMESPACE = '/notifications';

/* * */

const server = FastifyService.getInstance().server;

/* * */

server.register(
	(instance, opts, next) => {
		//

		// GET /notifications
		instance.get('/', NotificationsController.getAll);

		// GET /notifications/:id
		instance.get('/:id', NotificationsController.getById);

		// GET /notifications/:id/mark-as-read
		instance.get('/:id/mark-as-read', NotificationsController.markAsRead);

		// Delete /notifications/:id
		instance.delete('/:id', NotificationsController.delete);
		next();
	},
	{ prefix: NAMESPACE },
);
