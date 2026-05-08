/* * */

import { SamsController } from '@/endpoints/sams/sams.controller.js';
import { authorizationMiddleware, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/fastify';
import { type GetSamsBatchQuery, PermissionCatalog, type Sam, type SamListItem } from '@tmlmobilidade/types';

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
			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamListItem[]>) => SamsController.getBatch(request, reply),
		);

		instance.get(
			'/base',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamListItem[]>) => SamsController.getBatchBase(request, reply),
		);

		instance.get(
			'/apex-versions',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<string[]>) => SamsController.getApexVersions(request, reply),
		);

		instance.get(
			'/export/analysis',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.export]) },
			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<Sam[]>) => SamsController.getExportData(request, reply),
		);

		instance.get(
			'/favorites',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Querystring: { ids: string } }>, reply: FastifyReply<SamListItem[]>) => SamsController.getSamByIds(request, reply, PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read),
		);

		instance.get(
			'/timeline-summary',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Querystring: { ids: string } }>, reply: FastifyReply<Array<{ _id: number, timeline_summary: SamListItem['timeline_summary'] }>>) => SamsController.getTimelineSummaryByIds(request, reply),
		);

		instance.post(
			'/timeline-summary',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Body: { ids?: number[] } }>, reply: FastifyReply<Array<{ _id: number, timeline_summary: SamListItem['timeline_summary'] }>>) => SamsController.postTimelineSummaryByIds(request, reply),
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
