/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { getEmptyGtfsRtFeedMessage } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { type GtfsRtFeedMessage, Plan } from '@tmlmobilidade/types';

/* * */

export class PlansController {
	//

	/**
	 * Retrieves all plans that are approved together with the URL to the operation file
	 * This method is used to fetch plans that are ready for use in the system.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getApprovedPlans(request: FastifyRequest, reply: FastifyReply<Plan[]>) {
		// Get all plans that are approved
		const allPlans = await plans.all();
		// For each plan, get the file URL
		const plansWithFiles = await Promise.all(
			allPlans.map(async (plan) => {
				const file = await files.findById(plan.operation_file_id);
				return { ...plan, operation_file_url: file.url };
			}),
		);

		// Send all plans
		return reply.send({ data: plansWithFiles, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Download the latest GTFS merged file.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getGtfs(request: FastifyRequest, reply: FastifyReply<string>) {
		// Retrieve file data from database
		const foundFileData = await files.findById('gtfs-merged-latest');
		if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
		// Stream the file in the given URL to the client
		const storageServiceResponse = await fetch(foundFileData.url);
		if (!storageServiceResponse.ok || !storageServiceResponse.body) return reply.code(500).send('Could not fetch file.');
		// Set headers and pipe the response body to the client
		reply.header('Content-Disposition', `attachment; filename="gtfs-merged-latest.zip"`);
		reply.header('Content-Type', 'application/zip');
		// Set content length if available
		const contentLength = storageServiceResponse.headers.get('Content-Length');
		if (contentLength) reply.header('Content-Length', contentLength);
		// Pipe the response body to the client
		return reply.send(storageServiceResponse.body);
	}

	/**
	 * Download the latest GTFS merged file.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getGtfsCM(request: FastifyRequest, reply: FastifyReply<string>) {
		// Retrieve file data from database
		const foundFileData = await files.findById('gtfs-merged-latest');
		if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
		// Stream the file in the given URL to the client
		const storageServiceResponse = await fetch(foundFileData.url);
		if (!storageServiceResponse.ok || !storageServiceResponse.body) return reply.code(500).send('Could not fetch file.');
		// Set headers and pipe the response body to the client
		reply.header('Content-Disposition', `attachment; filename="gtfs-merged-latest.zip"`);
		reply.header('Content-Type', 'application/zip');
		// Set content length if available
		const contentLength = storageServiceResponse.headers.get('Content-Length');
		if (contentLength) reply.header('Content-Length', contentLength);
		// Pipe the response body to the client
		return reply.send(storageServiceResponse.body);
	}

	//
}
