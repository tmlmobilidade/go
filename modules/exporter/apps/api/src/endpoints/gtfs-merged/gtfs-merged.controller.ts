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
	static async download1(request: FastifyRequest, reply: FastifyReply<string>) {
		// Retrieve file data from database
		const foundFileData = await files.findById('gtfs-merged-latest');
		if (!foundFileData) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');
		// Stream the file in the given URL to the client
		return reply.redirect(foundFileData.url);
	}

	/**
	 * Download the latest GTFS merged file.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async download2(request: FastifyRequest, reply: FastifyReply<string>) {
		// Retrieve file data from database
		const foundFileData = await files.findById('gtfs-merged-latest');
		if (!foundFileData) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');
		// Download the file in the given URL to the client
		return reply
			.status(200)
			.header('Content-Disposition', 'attachment; filename="gtfs-merged-latest.zip"')
			.redirect(foundFileData.url);
	}

	//
}
