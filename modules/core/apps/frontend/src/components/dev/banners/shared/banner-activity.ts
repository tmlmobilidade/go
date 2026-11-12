import { type Banner } from '@tmlmobilidade/go-types-core';

/* * */

/** Publication and scheduled visibility are separate states. End times are exclusive. */
export function getBannerActivity(banner: Pick<Banner, 'ends_at' | 'publish_status' | 'starts_at'>, now = Date.now()) {
	//

	if (banner.publish_status !== 'published') return banner.publish_status;
	if (banner.ends_at !== null && banner.ends_at <= now) return 'expired';
	if (banner.starts_at !== null && banner.starts_at > now) return 'scheduled';

	return 'active';
}
