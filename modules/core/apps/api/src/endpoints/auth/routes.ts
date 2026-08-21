/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { changePasswordHandler } from './handlers/change-password.js';
import { loginHandler } from './handlers/login.js';
import { logoutHandler } from './handlers/logout.js';
import { sendPasswordResetEmailHandler } from './handlers/send-password-reset-email.js';

/* * */

const NAMESPACE = '/auth';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post('/login', loginHandler);

		instance.get('/logout', logoutHandler);

		instance.post('/send-password-reset-email', sendPasswordResetEmailHandler);

		instance.post('/change-password', changePasswordHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
