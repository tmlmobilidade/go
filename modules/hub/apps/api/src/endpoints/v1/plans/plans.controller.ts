/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Plan } from '@tmlmobilidade/types';

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
		//

		const cachedData = await apiCache.get('hub:plans:approved:json');

		if (!cachedData) {
			Logger.error('[hub/v1/plans:getApprovedPlans()] No cached data found for approved plans');
			return reply
				.header('access-control-allow-origin', '*')
				.header('cache-control', 'public, max-age=300')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		};

		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=300')
			.code(HTTP_STATUS.OK)
			.send({
				data: JSON.parse(cachedData),
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	}

	/**
	 * Download the latest GTFS merged file.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getGtfs(request: FastifyRequest, reply: FastifyReply<string>) {
		// Retrieve file data from database
		const foundFileData = await files.findById('gtfs-latest');
		if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
		// Stream the file in the given URL to the client
		const storageServiceResponse = await fetch(foundFileData.url);
		if (!storageServiceResponse.ok || !storageServiceResponse.body) {
			Logger.error(`[hub/v1/plans:getGtfs()] Failed to fetch file from storage service. URL: ${foundFileData.url}, Status: ${storageServiceResponse.status}`);
			return reply
				.header('access-control-allow-origin', '*')
				.header('cache-control', 'public, max-age=300')
				.code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send({
					data: null,
					error: 'Could not fetch file from storage service.',
					status_code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
				});
		}
		// Set headers and pipe the response body to the client
		reply.header('access-control-allow-origin', '*');
		reply.header('cache-control', 'public, max-age=300');
		reply.header('Content-Disposition', `attachment; filename="gtfs-latest.zip"`);
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
		const foundFileData = await files.findById('gtfs-cm-latest');
		if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
		// Stream the file in the given URL to the client
		const storageServiceResponse = await fetch(foundFileData.url);
		if (!storageServiceResponse.ok || !storageServiceResponse.body) return reply.code(500).send('Could not fetch file.');
		// Set headers and pipe the response body to the client
		reply.header('access-control-allow-origin', '*');
		reply.header('cache-control', 'public, max-age=300');
		reply.header('Content-Disposition', `attachment; filename="gtfs-cm-latest.zip"`);
		reply.header('Content-Type', 'application/zip');
		// Set content length if available
		const contentLength = storageServiceResponse.headers.get('Content-Length');
		if (contentLength) reply.header('Content-Length', contentLength);
		// Pipe the response body to the client
		return reply.send(storageServiceResponse.body);
	}

	//
}
