/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files } from '@tmlmobilidade/interfaces';
import { type File as FileType } from '@tmlmobilidade/types';

/**
 * Retrieves the posters file associated with a plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function getPosterById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<FileType>) {
	//

	//
	// Fetch the file associated with the plan

	const foundFileData = await files.findById(request.params.id);

	if (!foundFileData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Posters file not found');

	//
	// Return the file

	reply.send({
		data: foundFileData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
