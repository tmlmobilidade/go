/* * */

import { PinsSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/pins';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/controller',
			{ preHandler: authorizationMiddleware() },
			PinsSharedController.getMinePins,
		);

		instance.post(
			'/controller/add',
			{ preHandler: authorizationMiddleware() },
			PinsSharedController.saveMinePins,
		);

		instance.put(
			'/controller/remove',
			{ preHandler: authorizationMiddleware() },
			PinsSharedController.removeMinePins,
		);

		next();
	}, { prefix: NAMESPACE });
