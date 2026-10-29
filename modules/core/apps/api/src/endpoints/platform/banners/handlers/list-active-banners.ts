/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Banner, type BannerPlatformResponse, BannerPlatformResponseSchema, type BannersPlatformRequest, BannersPlatformRequestSchema } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

/**
 * List active banners for the authenticated user.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listActiveBannersHandler(request: FastifyRequest<{ Querystring: BannersPlatformRequest }>, reply: FastifyReply<BannerPlatformResponse[]>) {
	//

	// Prevent HTTP caches from storing notices filtered by this user's dismissals and the current schedule.
	reply.header('Cache-Control', 'no-store');

	//
	// Validate the requested module

	const query = BannersPlatformRequestSchema.safeParse(request.query);

	if (!query.success) {
		return sendErrorApiResponse(reply, {
			error: query.error.message,
			status_code: '400',
		});
	}

	//
	// Include only published notices whose scope and schedule apply now

	const { module_id: moduleId } = query.data;
	const userId = request.me._id;
	const time = Dates.now('utc').unix_milliseconds;

	const filter: Filter<Banner> = {
		$and: [
			{ $or: [{ starts_at: null }, { starts_at: { $lte: time } }] },
			{ $or: [{ ends_at: null }, { ends_at: { $gt: time } }] },
			{ $or: [{ 'scope.type': 'platform' }, ...(moduleId ? [{ 'scope.module_ids': moduleId, 'scope.type': 'modules' }] : [])] },
		],
		publish_status: 'published',
	};

	//
	// Load applicable banners and user dismissals

	const banners = await goDb.core.banners.findMany(filter);
	const dismissals = await goDb.core.bannerDismissals.findMany({ banner_id: { $in: banners.map(banner => banner._id) }, user_id: userId });

	const dismissed = new Map(dismissals.map(dismissal => [dismissal.banner_id, dismissal.dismissal_version]));
	const rank = { critical: 0, info: 2, warning: 1 };

	//
	// Hide dismissed versions and order the remaining notices

	const result = banners
		.filter(banner => !banner.dismissible || dismissed.get(banner._id) !== banner.dismissal_version)
		.sort((a, b) => rank[a.severity] - rank[b.severity] || b.created_at - a.created_at || b._id.localeCompare(a._id))
		.map(banner => BannerPlatformResponseSchema.parse(banner));

	return sendSuccessApiResponse(reply, result);
}
