// /* * */

// import { getApexVersions } from './handlers/get-apex-versions.js';
// import { getBatchBase } from './handlers/get-batch-base.js';
// import { getBatch } from './handlers/get-batch.js';
// import { getById } from './handlers/get-by-id.js';
// import { getExportData } from './handlers/get-export-data.js';
// import { getSamByIds } from './handlers/get-sam-by-ids.js';
// import { getTimelineSummaryByIds } from './handlers/get-timeline-summary.js';
// import { postTimelineSummaryByIds } from './handlers/post-timeline-summary.js';
// import { authorizationMiddleware, type FastifyReply, type FastifyRequest, FastifyService } from '@tmlmobilidade/go-clients-fastify';
// import { type GetSamsBatchQuery, PermissionCatalog, type Sam, type SamListItem } from '@tmlmobilidade/types';

// /* * */

// const NAMESPACE = '/sams';

// /* * */

// const server = FastifyService.getInstance().server;

// server.register(
// 	(instance, opts, next) => {
// 		//

// 		instance.get(
// 			'/',
// 			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
// 			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamListItem[]>) => getBatch(request, reply),
// 		);

// 		instance.get(
// 			'/base',
// 			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
// 			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamListItem[]>) => getBatchBase(request, reply),
// 		);

// 		instance.get(
// 			'/apex-versions',
// 			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
// 			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<string[]>) => getApexVersions(request, reply),
// 		);

// 		instance.get(
// 			'/export/analysis',
// 			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.export]) },
// 			(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<Sam[]>) => getExportData(request, reply),
// 		);

// 		instance.get(
// 			'/favorites',
// 			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
// 			(request: FastifyRequest<{ Querystring: { ids: string } }>, reply: FastifyReply<SamListItem[]>) => getSamByIds(request, reply, PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read),
// 		);

// 		instance.get(
// 			'/timeline-summary',
// 			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
// 			(request: FastifyRequest<{ Querystring: { ids: string } }>, reply: FastifyReply<Array<{ _id: number, timeline_summary: SamListItem['timeline_summary'] }>>) => getTimelineSummaryByIds(request, reply),
// 		);

// 		instance.post(
// 			'/timeline-summary',
// 			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
// 			(request: FastifyRequest<{ Body: { ids?: number[] } }>, reply: FastifyReply<Array<{ _id: number, timeline_summary: SamListItem['timeline_summary'] }>>) => postTimelineSummaryByIds(request, reply),
// 		);

// 		instance.get(
// 			'/:id',
// 			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
// 			(request: FastifyRequest, reply: FastifyReply<Sam>) => getById(request, reply),
// 		);

// 		next();
// 	},
// 	{ prefix: NAMESPACE },
// );
