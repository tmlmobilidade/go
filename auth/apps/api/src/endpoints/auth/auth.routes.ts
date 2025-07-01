/* * */

import { AuthController } from '@/endpoints/auth/auth.controller.js';
import { FastifyService } from '@tmlmobilidade/connectors';

/* * */

const NAMESPACE = '/';

/* * */

const server = FastifyService.getInstance().server;
const controller = new AuthController();

server.register(
	(instance, opts, next) => {
		// Login route
		instance.post('/login', async (request, reply) => {
			return controller.login(request, reply);
		});

		// Logout route
		instance.post('/logout', async (request, reply) => {
			return controller.logout(request, reply);
		});

		// Get permissions route
		instance.get('/permissions', async (request, reply) => {
			return controller.getPermissions(request, reply);
		});

		// Verify route
		instance.post('/verify', async (request, reply) => {
			return controller.verify(request, reply);
		});

		next();
	},
	{ prefix: NAMESPACE },
);
