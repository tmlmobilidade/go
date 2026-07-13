/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files, gtfsValidations, plans, TransactionManager } from '@tmlmobilidade/interfaces';
import { HashablePlanMetadata, PermissionCatalog, type Plan } from '@tmlmobilidade/types';
import { createHash } from 'node:crypto';

/**
 * Change the GTFS file of a plan by its _id.
 * @param request Fastify request containing plan ID in params and update data in body
 * @param reply Fastify reply
 */
export async function changeOperationFile(request: FastifyRequest<{ Body: { validation_id: string }, Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the Plan from the database

	const planData = await plans.findById(request.params.id);
	const originalFileId = planData.operation_file_id;
	if (!planData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
	}

	// Check if the user has permission to change the GTFS of the Plan
	const hasPermissionChangeGtfsPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.update_gtfs_plan,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.gtfs_agency.agency_id,
	});

	// Throw an error if the user is not authorized
	if (!hasPermissionChangeGtfsPlan) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to change the GTFS of the plan.');
	}

	// For a given validation ID, get the validation data
	const validationData = await gtfsValidations.findById(request.body.validation_id);
	if (!validationData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Validation not found');
	}

	// Create a new MongoDB transaction to manage the GTFS change
	// and perform all necessary operations atomically, with rollback on failure
	const transactionManager = new TransactionManager([plans, files] as const);

	// Execute the transaction and return the updated plan data
	const result = await transactionManager.withTransaction(async (collections, transactions) => {
		//

		// Get the appropriate transaction for each collection
		const [plansCollection, filesCollection] = collections;
		const plansTransaction = transactions.get(plansCollection);
		const filesTransaction = transactions.get(filesCollection);

		// Make a clone of the validation GTFS file in S3
		// to keep plan data separate from validations
		const updateFileResult = await filesCollection.clone(
			validationData.file_id,
			PermissionCatalog.all.plans.scope,
			planData._id.toString(),
			{ session: filesTransaction.getSession() },
		);

		// Get a hash of all metadata to make it possible
		// to keep track of changes to the plan
		const hashablePlanMetadata: HashablePlanMetadata = {
			_id: planData._id,
			gtfs_agency: planData.gtfs_agency,
			gtfs_feed_info: planData.gtfs_feed_info,
			operation_file_id: updateFileResult._id,
		};

		// Generate the hash value
		const hashValue = createHash('sha256')
			.update(JSON.stringify(hashablePlanMetadata))
			.digest('hex');

		// Update the plan with the new data
		const updatedPlanData = await plansCollection.updateById(
			planData._id,
			{ hash: hashValue, operation_file_id: updateFileResult._id },
			{ session: plansTransaction.getSession() },
		);

		// Return the updated plan data
		return updatedPlanData;
	});

	// Delete the old operation file
	await files.deleteById(originalFileId);

	// Send the updated plan data as the response
	reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });
}
