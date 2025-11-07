/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors-fastify';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { fileExports, files } from '@tmlmobilidade/interfaces';
import { type CreateFileExportDto, type FileExport } from '@tmlmobilidade/types';

/* * */

export class FileExporterController {
	//

	/**
	 * Returns an Agency by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static async create(request: FastifyRequest<{ Body: CreateFileExportDto<any> }>, reply: FastifyReply<FileExport>) {
		const fileExportData = await fileExports.insertOne({ ...request.body, created_by: request.me._id, updated_by: request.me._id });
		return reply.send({ data: fileExportData, error: null, statusCode: HttpStatus.CREATED });
	}

	/**
	 * Downloads a FileExport by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async download(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
		const { id } = request.params;
		const fileExport = await fileExports.findById(id);
		if (!fileExport) throw new HttpException(HttpStatus.NOT_FOUND, 'File export not found');

		const file = await files.findById(fileExport.file_id);
		if (!file) throw new HttpException(HttpStatus.NOT_FOUND, 'File not found');

		reply.send({ data: file.url, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns all FileExport sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<FileExport[]>) {
		const filters = {
			created_by: request.me._id,
		};

		const allFileExport = await fileExports.findMany(filters, { sort: { created_at: 1 } });
		return reply.send({ data: allFileExport, error: null, statusCode: HttpStatus.OK });
	}

	//
}
