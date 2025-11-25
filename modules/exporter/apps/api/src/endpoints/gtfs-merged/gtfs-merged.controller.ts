/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { fileExports, files } from '@tmlmobilidade/interfaces';

/* * */

export class ExporterController {
	//

	/**
	 * Downloads a FileExport by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async download(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
		// A. Get Exports and File
		const foundExport = await exports.findById(request.params.id);
		if (!exports) throw new HttpException(HttpStatus.NOT_FOUND, 'Exports not found');

		const file = await files.findById(exports.file_id);
		if (!file) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');

		reply.send({ data: file.url, error: null, statusCode: HttpStatus.OK });
	}

	//
}
