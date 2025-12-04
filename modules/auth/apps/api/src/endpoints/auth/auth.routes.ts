/* * */

import { AuthController } from '@/endpoints/auth/auth.controller.js';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/auth';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/login', AuthController.login);

		instance.get('/logout', AuthController.logout);

		instance.post('/send-password-reset-email', AuthController.sendPasswordResetEmail);

		instance.post('/change-password', AuthController.changePassword);

		next();
	},
	{ prefix: NAMESPACE },
);
