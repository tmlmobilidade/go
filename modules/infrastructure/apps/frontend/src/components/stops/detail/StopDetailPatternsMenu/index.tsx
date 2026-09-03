'use client';

import { IconEye, IconRouteOff } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Pattern } from '@tmlmobilidade/go-types-offer';
import { Menu, MenuItem, MenuList, MenuNoContent } from '@tmlmobilidade/ui';

/* * */

interface StopDetailPatternsMenuProps {
	patterns?: {
		_id: string
		code: string
		headsign: string
		line_id: string
		route_id: string
	}[]
}

/* * */

function StopDetailPatternsMenuItem({ item: pattern }: { item: Pattern }) {
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
					getItemKey={pattern => pattern._id}
					itemComponent={StopDetailPatternsMenuItem}
					maxHeight={500}
					title="Patterns associados"
				/>
			)}
		</Menu>
	);
}
