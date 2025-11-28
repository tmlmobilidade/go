/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files } from '@tmlmobilidade/interfaces';

/* * */

export class GtfsMergedController {
	//

	/**
	 * Downloads a FileExport by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async download(request: FastifyRequest, reply: FastifyReply<string>) {
		// Retrieve file data from database
		const foundFileData = await files.findById('gtfs-merged-latest');
		if (!foundFileData) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');
		// Send file URL as response to client
		reply.send({ data: foundFileData.url, error: null, statusCode: HttpStatus.OK });
	}

	//
}
