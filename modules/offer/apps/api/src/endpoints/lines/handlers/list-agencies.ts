/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type LinesAgencyItem, LinesAgencyItemSchema, type LinesAgencyRequest, LinesAgencyRequestSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Lists agencies allowed by the current user's requested scope and actions.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listAgenciesHandler(request: FastifyRequest<{ Body: LinesAgencyRequest }>, reply: FastifyReply<LinesAgencyItem[]>) {
	//

	//
	// Validate the permission query

	const validatedQuery = LinesAgencyRequestSchema.safeParse(request.body);

	if (!validatedQuery.success) {
		return sendErrorApiResponse(reply, { error: validatedQuery.error.message, status_code: '400' });
	}

	//
	// Resolve allowed agency IDs from the authenticated user's permissions

	const { permissions } = validatedQuery.data;
	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: permissions.actions.map(action => ({ action, scope: permissions.scope })),
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	//
	// Return all permitted agencies, keeping agencies with the same code separate

	const pipeline: AggregationPipeline<LinesAgencyItem> = [
		{ $match: agencyAccess.allowAll ? {} : { _id: { $in: agencyAccess.values } } },
		{ $project: Object.fromEntries(Object.keys(LinesAgencyItemSchema.shape).map(key => [key, 1])) },
		{ $sort: { _id: -1 } },
	];

	const agencies = await goDb.core.agencies.aggregate(pipeline);

	return sendSuccessApiResponse(reply, LinesAgencyItemSchema.array().parse(agencies ?? []));
}
