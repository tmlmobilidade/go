'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type EventsPatternsResponse } from '@tmlmobilidade/go-offer-pckg-types';
import { MenuItem } from '@tmlmobilidade/ui';

/* * */

export function EventsDetailPatternsMenuItem({ item: pattern }: { item: EventsPatternsResponse[number] }) {
	return (
		<MenuItem
			description={pattern.headsign}
			href={PAGE_ROUTES.offer.PATTERN_DETAIL(pattern.line_id, pattern._id, pattern.route_id)}
			rel="noopener noreferrer"
			target="_blank"
			title={pattern.code}
		/>
	);
}
