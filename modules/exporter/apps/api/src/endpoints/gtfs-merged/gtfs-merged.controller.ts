/* * */

import { HttpException, HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files } from '@tmlmobilidade/interfaces';

/* * */

export class GtfsMergedController {
	//

	/**
	 * Download the latest GTFS merged file.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async download(request: FastifyRequest, reply: FastifyReply<string>) {
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
