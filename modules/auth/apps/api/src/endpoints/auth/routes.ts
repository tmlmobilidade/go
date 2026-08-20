/* * */

import { AuthController } from '@/endpoints/auth/auth.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';

import { getMe } from './controllers/get-me.js';
import { login } from './controllers/login.js';

/* * */

const NAMESPACE = '/auth';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/login', login);

		instance.get('/logout', AuthController.logout);

		instance.post('/send-password-reset-email', AuthController.sendPasswordResetEmail);

		instance.post('/change-password', AuthController.changePassword);

		instance.get('/me', { preHandler: authorizationMiddleware() }, getMe);

		next();
	},
	{ prefix: NAMESPACE },
);
