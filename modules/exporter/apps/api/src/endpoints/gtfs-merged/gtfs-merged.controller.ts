/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
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
		if (!foundFileData) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');
		// Redirect to the file URL
		return reply.redirect(foundFileData.url);
	}

	//
}
