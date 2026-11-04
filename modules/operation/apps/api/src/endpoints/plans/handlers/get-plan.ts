/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PlansDetailItem } from '@tmlmobilidade/go-operation-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { getPlanSummary } from '../utils/get-plan-summary.js';

/**
 * Retrieves a single plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function getPlanHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<PlansDetailItem>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDb.operation.plans.findById(request.params.id);

	if (!planData) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if have permissions to read the plan

	const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.agency_id,
	});

	if (!hasPermissionReadPlan) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this plan.',
			status_code: '403',
		});
	}

	//
	// Read only this plan's agency rate, after checking access to the plan.

	const agencyData = await goDb.core.agencies.findById(planData.agency_id, { projection: { 'financials.price_per_km': 1 } });

	return sendSuccessApiResponse(reply, {
		...planData,
		summary: getPlanSummary(planData, agencyData?.financials?.price_per_km),
	});
}
