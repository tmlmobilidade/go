/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

interface ExportPostersResponse {
	success: boolean
}

/**
 * Lists the plans to generate posters.
 * @param request Fastify request containing the plan ID
 * @param reply Fastify reply
 */
export async function listPlanToGeneratePosters(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<ExportPostersResponse>) {
	//

	//
	// Get the plan data

	const planData = await goDb.operation.plans.findById(request.params.id);

	if (!planData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
	}

	//
	// Check if the user has permission to generate posters

	const userGeneratePostersPermissions = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.generate_pdf_posters,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.gtfs_agency.agency_id,
	});

	if (!userGeneratePostersPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to generate posters for this plan.');
	}

	//
	// Save status to the plan processing posters

	await goDb.operation.plans.updateById(planData._id, {
		apps: {
			...planData.apps,
			posters: {
				file_id: null,
				job_id: null,
				last_hash: null,
				requested_by: request.me.email,
				status: 'waiting',
				step: null,
				timestamp: null,
			},
		},
	});

	//

	reply.send({
		data: { success: true },
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
