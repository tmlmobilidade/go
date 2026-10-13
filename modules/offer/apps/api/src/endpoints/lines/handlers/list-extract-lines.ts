import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type LinesExtractItem, LinesExtractItemSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { LineSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Lists the permitted agency's lines for extraction.
 * @param request The request containing the agency filter.
 * @param reply The response containing extraction line items.
 */
export async function listExtractLinesHandler(request: FastifyRequest<{ Params: { agencyId: string } }>, reply: FastifyReply<LinesExtractItem[]>) {
	//

	//
	// Validate the agency ID

	const agencyId = LineSchema.shape.agency_id.safeParse(request.params.agencyId);

	if (!agencyId.success) {
		return sendErrorApiResponse(reply, { error: agencyId.error.message, status_code: '400' });
	}

	//
	// Restrict the selected agency to the user's extraction permissions

	const allowedAgencyIds = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.lines.actions['extract-stepp'],
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		values: [agencyId.data],
	});

	if (!allowedAgencyIds.length) {
		return sendErrorApiResponse(reply, { error: 'User does not have permission to extract lines for the selected agency.', status_code: '403' });
	}

	//
	// Fetch only the fields required by the extraction selector

	const pipeline: AggregationPipeline<LinesExtractItem> = [
		{ $match: { agency_id: { $in: allowedAgencyIds } } },
		{ $project: Object.fromEntries(Object.keys(LinesExtractItemSchema.shape).map(key => [key, 1])) },
	];

	const lines = await goDb.offer.lines.aggregate(pipeline);

	return sendSuccessApiResponse(reply, LinesExtractItemSchema.array().parse(lines ?? []));
}
