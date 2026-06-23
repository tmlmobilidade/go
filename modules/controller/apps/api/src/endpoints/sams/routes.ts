/* * */

import { getApexVersions } from '@/endpoints/sams/controllers/get-apex-versions.js';
import { getBatchBase } from '@/endpoints/sams/controllers/get-batch-base.js';
import { getBatch } from '@/endpoints/sams/controllers/get-batch.js';
import { getById } from '@/endpoints/sams/controllers/get-by-id.js';
import { getExportData } from '@/endpoints/sams/controllers/get-export-data.js';
import { getSamByIds } from '@/endpoints/sams/controllers/get-sam-by-ids.js';
import { getTimelineSummaryByIds } from '@/endpoints/sams/controllers/get-timeline-summary.js';
import { postTimelineSummaryByIds } from '@/endpoints/sams/controllers/post-timeline-summary.js';
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
			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamListItem[]>) => getBatch(request, reply),
		);

		instance.get(
			'/base',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamListItem[]>) => getBatchBase(request, reply),
		);

		instance.get(
			'/apex-versions',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<string[]>) => getApexVersions(request, reply),
		);

		instance.get(
			'/export/analysis',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.export]) },
			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<Sam[]>) => getExportData(request, reply),
		);

		instance.get(
			'/favorites',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Querystring: { ids: string } }>, reply: FastifyReply<SamListItem[]>) => getSamByIds(request, reply, PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read),
		);

		instance.get(
			'/timeline-summary',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Querystring: { ids: string } }>, reply: FastifyReply<Array<{ _id: number, timeline_summary: SamListItem['timeline_summary'] }>>) => getTimelineSummaryByIds(request, reply),
		);

		instance.post(
			'/timeline-summary',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest<{ Body: { ids?: number[] } }>, reply: FastifyReply<Array<{ _id: number, timeline_summary: SamListItem['timeline_summary'] }>>) => postTimelineSummaryByIds(request, reply),
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			(request: FastifyRequest, reply: FastifyReply<Sam>) => getById(request, reply),
		);

		next();
	},
	{ prefix: NAMESPACE },
);
