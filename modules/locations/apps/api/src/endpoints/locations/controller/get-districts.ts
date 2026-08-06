/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { District } from '@tmlmobilidade/types';

/**
 * Retrieves all districts.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function getDistricts(request: FastifyRequest, reply: FastifyReply<District[]>) {
	//

	//
	// Fetch all districts

	const districts = await locationsProvider.findDistricts();

	return reply.send({ data: districts, error: null, statusCode: HTTP_STATUS.OK });

	//
}
