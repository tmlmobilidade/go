'use client';

import { IconEye, IconRouteOff } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Event } from '@tmlmobilidade/types';
import { Menu, MenuItem, MenuList, MenuNoContent } from '@tmlmobilidade/ui';

/* * */

interface StopDetailPatternsMenuProps {
	patterns?: Event['associated_patterns']
}

/* * */

export function StopDetailPatternsMenu({ patterns = [] }: StopDetailPatternsMenuProps) {
	return (
		<Menu
			counter={patterns.length}
			icon={IconEye}
			label="Ver patterns associados"
			variant="primary"
			width={320}
		>
			{patterns.length === 0 ? (
				<MenuNoContent
					icon={IconRouteOff}
					text="Sem patterns associados"
				/>
			) : (
				<MenuList
					data={patterns}
					maxHeight={500}
					title="Patterns associados"
					itemComponent={({ item: pattern }) => (
						<MenuItem
							description={pattern.headsign}
							href={PAGE_ROUTES.offer.PATTERN_DETAIL(pattern.line_id, pattern._id, pattern.route_id)}
							rel="noopener noreferrer"
							target="_blank"
							title={pattern.code}
						/>
					)}
				/>
			)}
		</Menu>
	);
}
