import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type FileExport } from '@tmlmobilidade/go-types-downloads';

/**
 * Returns the current user's file exports, newest first.
 * @param request The request object
 * @param reply The reply object
 */
export async function listExports(request: FastifyRequest, reply: FastifyReply<FileExport[]>) {
	//

	//
	// Get the file exports

	const fileExports = await goDb.core.exports.findMany(
		{
			created_by: request.me._id,
		},
		{
			sort: {
				created_at: -1,
			},
		},
	);

	//
	// Return the file exports
	return sendSuccessApiResponse(reply, fileExports);
}
