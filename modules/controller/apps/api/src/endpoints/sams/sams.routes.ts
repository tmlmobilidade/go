/* * */

import { SamsController } from '@/endpoints/sams/sams.controller.js';
import { authorizationMiddleware, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { type GetSamsBatchQuery, PermissionCatalog, type Sam } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/sams';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<Sam[]>) => SamsController.getBatch(request, reply),
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest, reply: FastifyReply<Sam>) => SamsController.getById(request, reply),
		);

		next();
	},
	{ prefix: NAMESPACE },
);
