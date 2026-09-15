'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { MenuItem } from '@tmlmobilidade/ui';

/* * */

interface EventsDetailPatternsMenuItemProps {
	item: Event['associated_patterns'][number]
}

/* * */

export function EventsDetailPatternsMenuItem({ item }: EventsDetailPatternsMenuItemProps) {
	return (
		<MenuItem
			description={item.headsign}
			href={PAGE_ROUTES.offer.PATTERN_DETAIL(item.line_id, item._id, item.route_id)}
			rel="noopener noreferrer"
			target="_blank"
			title={item.code}
		/>
	);
}
