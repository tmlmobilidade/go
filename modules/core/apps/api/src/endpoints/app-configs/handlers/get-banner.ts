/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type AppConfigBanner, AppConfigBannerIdValue } from '@tmlmobilidade/go-types-core';

/**
 * Returns the current banner app config.
 * @param request The request object
 * @param reply The reply object
 */
export async function getBannerHandler(request: FastifyRequest, reply: FastifyReply<AppConfigBanner | null>) {
	//

	//
	// Get the banner app config

	const foundAppConfig = await goDb.core.appConfigs.findById(AppConfigBannerIdValue);

	if (!foundAppConfig) {
		return sendErrorApiResponse(reply, {
			error: 'Banner not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundAppConfig);
}
