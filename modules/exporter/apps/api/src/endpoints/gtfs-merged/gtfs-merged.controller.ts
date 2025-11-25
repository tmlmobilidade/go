/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { fileExports, files } from '@tmlmobilidade/interfaces';

/* * */

export class GtfsMergedController {
	//

	/**
	 * Downloads a FileExport by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async download(request: FastifyRequest, reply: FastifyReply<string>) {
		// Retrieve file export record from database
		const foundFileExports = await fileExports.findById('gtfs-merged-latest');
		if (!foundFileExports) throw new HttpException(HttpStatus.NOT_FOUND, 'File Export not found');
		// Retrieve file data from database
		const foundFileData = await files.findById(foundFileExports.file_id);
		if (!foundFileData) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');
		// Send file URL as response to client
		reply.send({ data: foundFileData.url, error: null, statusCode: HttpStatus.OK });
	}

	//
}
