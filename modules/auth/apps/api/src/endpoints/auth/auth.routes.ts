/* * */

import { AuthController } from '@/endpoints/auth/auth.controller.js';
import { FastifyService } from '@tmlmobilidade/connectors-fastify';

/* * */

const NAMESPACE = '/auth';

/* * */

const server = FastifyService.getInstance().server;
const controller = new AuthController();

server.register(
	(instance, opts, next) => {
		// Login route
		instance.post('/login', controller.login);

		// Logout route
		instance.get('/logout', controller.logout);

		// Get permissions route
		instance.get('/permissions', controller.getPermissions);

		// Verify route
		instance.post('/verify', controller.verify);

		// Verify Email
		instance.post('/verify-email', controller.sendEmailWithResetPasswordURL);

		// Change password
		instance.post('/change-password', controller.changePassword);

		next();
	},
	{ prefix: NAMESPACE },
);
