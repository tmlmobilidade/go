/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type DismissBannerDto, type DismissBannerResult, DismissBannerSchema } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

/**
 * Dismiss banner for the authenticated user.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function dismissBannerHandler(request: FastifyRequest<{ Body: DismissBannerDto, Params: { id: string } }>, reply: FastifyReply<DismissBannerResult>) {
	//

	//
	// Validate the requested banner version

	const validated = DismissBannerSchema.safeParse(request.body);

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

	const isActive = banner.status === 'published' && scopeMatches && (banner.starts_at === null || banner.starts_at <= time) && (banner.ends_at === null || time < banner.ends_at);

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
	// Save the dismissal without replacing a newer version

	const dismissal = {
		_id: JSON.stringify([userId, id]),
		banner_id: id,
		dismissal_version: version,
		dismissed_at: time,
		user_id: userId,
	};

	try {
		// A delayed request cannot overwrite a dismissal of a newer version.
		await goDb.core.bannerDismissals.replaceOne({ _id: dismissal._id, dismissal_version: { $lte: version } }, dismissal, { upsert: true });
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
			return sendErrorApiResponse(reply, {
				error: 'Banner dismissal changed; refresh and retry',
				status_code: '409',
			});
		}

		throw error;
	}

	return sendSuccessApiResponse(reply, { success: true });
}
