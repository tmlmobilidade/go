/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type BannerDismissPlatformRequest, BannerDismissPlatformRequestSchema, type BannerDismissPlatformResponse } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

/**
 * Dismiss banner for the authenticated user.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function dismissBannerHandler(request: FastifyRequest<{ Body: BannerDismissPlatformRequest, Params: { id: string } }>, reply: FastifyReply<BannerDismissPlatformResponse>) {
	//

	//
	// Validate the requested banner version

	const validated = BannerDismissPlatformRequestSchema.safeParse(request.body);

	if (!validated.success) {
		return sendErrorApiResponse(reply, {
			error: validated.error.message,
			status_code: '400',
		});
	}

	const { dismissal_version: version, module_id: moduleId } = validated.data;
	const userId = request.me._id;
	const id = request.params.id;

	//
	// Check scope, schedule and dismissibility

	const banner = await goDb.core.banners.findById(id);

	if (!banner) {
		return sendErrorApiResponse(reply, {
			error: 'Active banner not found',
			status_code: '404',
		});
	}

	const time = Dates.now('utc').unix_milliseconds;
	const scopeMatches = banner.scope.type === 'platform' || (moduleId !== undefined && banner.scope.module_ids.includes(moduleId));

	const isActive = banner.publish_status === 'published' && scopeMatches && (banner.starts_at === null || banner.starts_at <= time) && (banner.ends_at === null || time < banner.ends_at);

	if (!isActive) {
		return sendErrorApiResponse(reply, {
			error: 'Active banner not found',
			status_code: '404',
		});
	}

	if (!banner.dismissible || banner.dismissal_version !== version) {
		return sendErrorApiResponse(reply, {
			error: 'Banner cannot be dismissed at this version; refresh and retry',
			status_code: '409',
		});
	}

	//
	// Merge the dismissal into the current user's state

	const user = await goDb.core.users.findById(userId);

	if (!user) {
		return sendErrorApiResponse(reply, { error: 'User not found', status_code: '404' });
	}

	const dismissals = user.dismissed_banners ?? [];
	const previous = dismissals.find(entry => entry.banner_id === id);

	if (!previous || previous.dismissal_version < version) {
		const updatedDismissals = [
			...dismissals.filter(entry => entry.banner_id !== id),
			{ banner_id: id, dismissal_version: version, dismissed_at: time },
		];
		await goDb.core.users.updateOne({ _id: userId }, { dismissed_banners: updatedDismissals });
	}

	return sendSuccessApiResponse(reply, { success: true });
}
