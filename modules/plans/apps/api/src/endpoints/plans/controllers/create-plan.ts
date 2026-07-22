/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files, gtfsValidations, plans, TransactionManager } from '@tmlmobilidade/interfaces';
import { type CreatePlanDto, HashablePlanMetadata, PermissionCatalog, type Plan } from '@tmlmobilidade/types';
import { createHash } from 'node:crypto';

/**
 * Creates a new plan from a validation ID.
 * @param request Fastify request containing plan data and operation plan file in multipart form
 * @param reply Fastify reply
 */
export async function createPlan(request: FastifyRequest<{ Body: { validation_id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// For a given validation ID, create a new plan

	const validationData = await gtfsValidations.findById(request.body.validation_id);

	if (!validationData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');
	}

	//
	// Start a new MongoDB transaction to duplicate the plan,
	// copy the operation file, and update the plan with the new file reference

	const transactionManager = new TransactionManager([plans, files] as const);

	const result = await transactionManager.withTransaction(async (collections, transactions) => {
		//

		//
		// Get the appropriate transaction for each collection

		const [plansCollection, filesCollection] = collections;

		const plansTransaction = transactions.get(plansCollection);
		const filesTransaction = transactions.get(filesCollection);

		//
		// Create a new plan object based on the validation data
		// and save it to the database

		const newPlanData: CreatePlanDto = {
			apex_file_id: null,
			apps: {
				controller: {
					last_hash: null,
					status: 'waiting',
					timestamp: null,
				},
				hub_gtfs: {
					last_hash: null,
					status: 'waiting',
					timestamp: null,
				},
				hub_schedules: {
					last_hash: null,
					status: 'waiting',
					timestamp: null,
				},
				merger: {
					last_hash: null,
					status: 'waiting',
					timestamp: null,
				},
				posters: {
					file_id: null,
					job_id: null,
					last_hash: null,
					requested_by: null,
					status: 'skipped',
					step: null,
					timestamp: null,
				},
			},
			created_by: request.me._id,
			gtfs_agency: validationData.gtfs_agency,
			gtfs_feed_info: validationData.gtfs_feed_info,
			hash: '',
			is_locked: false,
			operation_file_id: null,
			pcgi_legacy: {
				operation_plan_id: '',
			},
		};

		const planResult = await plansCollection.insertOne(
			newPlanData,
			{ options: { session: plansTransaction.getSession() } },
		);

		//
		// Make a clone of the validation GTFS file in S3
		// to keep plan data separate from validations

		const fileResult = await filesCollection.clone(
			validationData.file_id,
			PermissionCatalog.all.plans.scope,
			planResult._id.toString(),
			{ session: filesTransaction.getSession() },
		);

		//
		// Get a hash of all metadata to make it possible
		// to keep track of changes to the plan

		const hashablePlanMetadata: HashablePlanMetadata = {
			_id: planResult._id,
			gtfs_agency: planResult.gtfs_agency,
			gtfs_feed_info: planResult.gtfs_feed_info,
			operation_file_id: fileResult._id,
		};

		const hashValue = createHash('sha256')
			.update(JSON.stringify(hashablePlanMetadata))
			.digest('hex');

		//
		// Associate the cloned file and the hash to the plan object
		// and return it to the caller

		const finalPlanResult = await plansCollection.updateById(
			planResult._id,
			{ hash: hashValue, operation_file_id: fileResult._id },
			{ session: plansTransaction.getSession() },
		);

		return finalPlanResult;
	});

	//
	// Send the transaction result as the response

	reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });

	//
}
