/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { fileExports } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { CreateFileExportDto, FileExport } from '@tmlmobilidade/types';

/* * */

export class FileExporterController {
	//

	/**
	 * Returns an Agency by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async create(request: FastifyRequest<{ Body: CreateFileExportDto }>, reply: FastifyReply<FileExport>) {
		const fileExportData = await fileExports.insertOne({ ...request.body, created_by: request.me._id, updated_by: request.me._id });
		return reply.send({ data: fileExportData, error: null, statusCode: HttpStatus.CREATED });
	}

	/**
	 * Returns all FileExport sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<FileExport[]>) {
		const allFileExport = await fileExports.findMany({ created_by: request.me._id }, { sort: { created_at: 1 } });
		return reply.send({ data: allFileExport, error: null, statusCode: HttpStatus.OK });
	}

	//
}
