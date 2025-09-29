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

		// Put /notifications/:id
		instance.put('/:id', NotificationsController.markAsRead);
		next();
	},
	{ prefix: NAMESPACE },
);
