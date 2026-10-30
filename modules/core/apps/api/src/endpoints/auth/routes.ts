/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { changePasswordHandler } from './handlers/change-password.js';
import { loginHandler } from './handlers/login.js';
import { logoutHandler } from './handlers/logout.js';
import { sendPasswordResetEmailHandler } from './handlers/send-password-reset-email.js';
import { authRateLimit } from './rate-limit.js';

/* * */

const NAMESPACE = '/auth';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/login', { preHandler: authRateLimit('login') }, loginHandler);

		instance.get('/logout', logoutHandler);

		instance.post('/send-password-reset-email', { preHandler: authRateLimit('recovery') }, sendPasswordResetEmailHandler);

		instance.post('/change-password', { preHandler: authRateLimit('reset') }, changePasswordHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
