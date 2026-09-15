'use client';

import { EventsDetailPatternsMenuItem } from '@/components/events/detail/EventsDetailPatternsMenuItem';
import { IconEye, IconRouteOff } from '@tabler/icons-react';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { Menu, MenuList, MenuNoContent } from '@tmlmobilidade/ui';

/* * */

interface EventsDetailPatternsMenuProps {
	value: Event['associated_patterns']
}

/* * */

export function EventsDetailPatternsMenu({ value }: EventsDetailPatternsMenuProps) {
	return (
		<Menu
			counter={value.length}
			icon={IconEye}
			label="Ver patterns associados"
			variant="primary"
			width={320}
		>
			{value.length === 0 ? (
				<MenuNoContent
					icon={IconRouteOff}
					text="Sem patterns associados"
				/>
			) : (
				<MenuList
					data={value}
					getItemKey={pattern => pattern._id}
					itemComponent={EventsDetailPatternsMenuItem}
					maxHeight={500}
					title="Patterns associados"
				/>
			)}
		</Menu>
	);
}
