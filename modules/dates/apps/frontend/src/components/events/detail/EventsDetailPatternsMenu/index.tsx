'use client';

import { IconEye, IconRouteOff } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Event } from '@tmlmobilidade/types';
import { TopbarMenu, TopbarMenuItem, TopbarMenuList, TopbarMenuNoContent } from '@tmlmobilidade/ui';

/* * */

interface EventsDetailPatternsMenuProps {
	patterns?: Event['associated_patterns']
}

/* * */

export function EventsDetailPatternsMenu({ patterns = [] }: EventsDetailPatternsMenuProps) {
	return (
		<TopbarMenu
			counter={patterns.length}
			icon={IconEye}
			label="Ver patterns associados"
			variant="primary"
			width={320}
		>
			{patterns.length === 0 ? (
				<TopbarMenuNoContent
					icon={IconRouteOff}
					text="Sem patterns associados"
				/>
			) : (
				<TopbarMenuList
					data={patterns}
					maxHeight={500}
					title="Patterns associados"
					itemComponent={({ item: pattern }) => (
						<TopbarMenuItem
							description={pattern.headsign}
							href={PAGE_ROUTES.offer.PATTERN_DETAIL(pattern.line_id, pattern._id, pattern.route_id)}
							rel="noopener noreferrer"
							target="_blank"
							title={pattern.code}
						/>
					)}
				/>
			)}
		</TopbarMenu>
	);
}
