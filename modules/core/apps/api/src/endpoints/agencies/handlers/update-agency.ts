/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Agency, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/go-types-core';
import { normalizeValidationRules } from '@tmlmobilidade/go-types-gtfs-validator';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Updates an Agency in the database
 * @param request The request object
 * @param reply The reply object
 */
export async function updateAgencyHandler(request: FastifyRequest<{ Body: UpdateAgencyDto, Params: { id: string } }>, reply: FastifyReply<Agency>) {
	//

	//
	// Validate the request body

	const validatedAgency = UpdateAgencySchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedAgency.success) {
		Logger.warning({ error: validatedAgency.error, message: 'Invalid agency data' });
		return sendErrorApiResponse(reply, {
			error: validatedAgency.error.message,
			status_code: '400',
		});
	}

	if (validatedAgency.data.plans) {
		try {
			validatedAgency.data.plans.validation_rules = normalizeValidationRules(validatedAgency.data.plans.validation_rules);
		} catch (error) {
			return sendErrorApiResponse(reply, { error: error instanceof Error ? error.message : String(error), status_code: '400' });
		}
	}

	//
	// Update the agency in the database

	const updatedAgencyData = await goDb.core.agencies.updateById(request.params.id, validatedAgency.data);

	return sendSuccessApiResponse(reply, updatedAgencyData);
}
