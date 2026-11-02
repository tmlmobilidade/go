/* * */

import { getModuleConfig } from '@tmlmobilidade/consts';
import { FastifyService, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';

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

		instance.addHook('onRequest', async (request, reply) => {
			if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
			const trustedOrigin = new URL(getModuleConfig('core', 'frontend_url')!).origin;
			if (request.headers.origin !== trustedOrigin) {
				return sendErrorApiResponse(reply, { error: 'Untrusted request origin', status_code: '403' });
			}
		});

		instance.post('/login', loginHandler);

		instance.post('/logout', logoutHandler);

		instance.post('/send-password-reset-email', sendPasswordResetEmailHandler);

		instance.post('/change-password', changePasswordHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
