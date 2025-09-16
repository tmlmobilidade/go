/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { quick_links } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { type QuickLink, UpdateQuickLinkDto, UpdateQuickLinkSchema } from '@tmlmobilidade/types';

/* * */

export class QuickLinksController {
	//

	/**
	 * Returns all QuickLinks sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<QuickLink[]>) {
		const allQuickLinks = await quick_links.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allQuickLinks, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns a QuickLink by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<QuickLink>) {
		const quickLinkData = await quick_links.findById(request.params.id);
		if (!quickLinkData) throw new HttpException(HttpStatus.NOT_FOUND, 'QuickLink not found');
		reply.send({ data: quickLinkData, error: null, statusCode: HttpStatus.OK });
	}

	/**
	* Updates an Quick Link in the database
	* @param request The request object
	* @param reply The reply object
	*/
	static async update(request: FastifyRequest<{ Body: UpdateQuickLinkDto, Params: { id: string } }>, reply: FastifyReply<QuickLink>) {
		const validatedQuickLink = UpdateQuickLinkSchema.strip().safeParse(request.body);
		if (!validatedQuickLink.success) throw new HttpException(HttpStatus.BAD_REQUEST, 'Dados inválidos', validatedQuickLink.error);

		//
		// Set the updated_by field to the current user's id
		request.body.updated_by = request.me._id;

		//
		const updatedQuickLinkData = await quick_links.updateById(request.params.id, validatedQuickLink.data);
		reply.send({ data: updatedQuickLinkData, error: null, statusCode: HttpStatus.OK });
	}

	//
}
