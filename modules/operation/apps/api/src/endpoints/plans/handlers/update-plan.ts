/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { getPlanHash } from '@tmlmobilidade/go-operation-pckg-utils';
import { type Plan, type UpdatePlanDto } from '@tmlmobilidade/go-types-operation';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';

/**
 * Updates an existing plan by ID
 * @param request Fastify request containing plan ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updatePlanHandler(request: FastifyRequest<{ Body: UpdatePlanDto & { apex_file?: File }, Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the Plan from the database

	const foundPlan = await goDb.operation.plans.findById(request.params.id);

	if (!foundPlan) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to update the Plan

	const hasPermissionUpdatePlan = hasPermissionResource(request.permissions, {
		requiredPermission: { action: 'update', scope: 'plans' },
		requiredValue: foundPlan.agency_id,
		resourceKey: 'agency_ids',
	});

	if (!hasPermissionUpdatePlan) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this plan.',
			status_code: '403',
		});
	}

	//
	// Validate the new feed info dates

	const validatedFeedStartDate = OperationalDateIntSchema.parse(request.body.active_from);
	const validatedFeedEndDate = OperationalDateIntSchema.parse(request.body.active_until);

	if (validatedFeedStartDate > validatedFeedEndDate) {
		return sendErrorApiResponse(reply, {
			error: 'Feed start date cannot be after feed end date',
			status_code: '400',
		});
	}

	//
	// Check if the dates actually changed
	// to avoid unnecessary file updates

	if (foundPlan.active_from !== validatedFeedStartDate || foundPlan.active_until !== validatedFeedEndDate) {
		//

		//
		// Check if the user has permission to update the feed info dates

		const hasPermissionUpdateFeedInfoDates = hasPermissionResource(request.permissions, {
			requiredPermission: { action: 'update_feed_info_dates', scope: 'plans' },
			requiredValue: foundPlan.agency_id,
			resourceKey: 'agency_ids',
		});

		if (!hasPermissionUpdateFeedInfoDates) {
			return sendErrorApiResponse(reply, {
				error: 'You are not authorized to update the feed info dates.',
				status_code: '403',
			});
		}

		//
		// Get a hash of all metadata to make it possible
		// to keep track of changes to the plan

		const hashValue = await getPlanHash({
			activeFrom: validatedFeedStartDate,
			activeUntil: validatedFeedEndDate,
			operationFileId: foundPlan.operation_file_id,
			planId: foundPlan._id,
		});

		//
		// Update the plan in the database

		await goDb.operation.plans.updateById(foundPlan._id, {
			active_from: validatedFeedStartDate,
			active_until: validatedFeedEndDate,
			hash: hashValue,
			operation_file_id: foundPlan.operation_file_id,
		});

		//
	}

	//
	// Re-fetch the plan data to get the updated data

	const updatedPlanData = await goDb.operation.plans.findById(request.params.id);

	if (!updatedPlanData) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Send the updated plan data as the response

	return sendSuccessApiResponse(reply, updatedPlanData);
}
