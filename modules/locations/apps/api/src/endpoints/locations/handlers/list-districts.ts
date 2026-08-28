/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type District } from '@tmlmobilidade/go-types-locations';

/**
 * Lists all districts.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function listDistrictsHandler(request: FastifyRequest, reply: FastifyReply<District[]>) {
	//

	//
	// Fetch all districts

	const districts = await locationsProvider.findDistricts();

	return reply.send({ data: districts, error: null, statusCode: HTTP_STATUS.OK });

	//
}
