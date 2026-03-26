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
			PinsSharedController.getMineControllerPins,
		);

		instance.post(
			'/controller/add',
			{ preHandler: authorizationMiddleware() },
			PinsSharedController.saveMineControllerPins,
		);

		instance.put(
			'/controller/remove',
			{ preHandler: authorizationMiddleware() },
			PinsSharedController.removeMineControllerPins,
		);

		next();
	}, { prefix: NAMESPACE });
