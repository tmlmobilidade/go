import { type OperationalBanner } from '@tmlmobilidade/go-types-core';

/* * */

/** Publication and scheduled visibility are separate states. End times are exclusive. */
export function getBannerActivity(banner: Pick<OperationalBanner, 'ends_at' | 'starts_at' | 'status'>, now = Date.now()) {
	//

	if (banner.status !== 'published') return banner.status;
	if (banner.ends_at !== null && banner.ends_at <= now) return 'expired';
	if (banner.starts_at !== null && banner.starts_at > now) return 'scheduled';

	return 'active';
}
