'use client';

import { IconEye, IconRouteOff } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type EventsDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { Menu, MenuItem, MenuList, MenuNoContent } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface EventsDetailPatternsMenuProps {
	patterns?: EventsDetail['associated_patterns']
}

/* * */

function EventsDetailPatternsMenuItem({ item: pattern }: { item: EventsDetail['associated_patterns'][number] }) {
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

export function EventsDetailPatternsMenu({ patterns = [] }: EventsDetailPatternsMenuProps) {
	const { t } = useTranslation();

	return (
		<Menu
			counter={patterns.length}
			icon={IconEye}
			label={t('default:events.ruleEditor.viewPatterns')}
			variant="primary"
			width={320}
		>
			{patterns.length === 0 ? (
				<MenuNoContent
					icon={IconRouteOff}
					text={t('default:events.ruleEditor.noPatterns')}
				/>
			) : (
				<MenuList
					data={patterns}
					getItemKey={pattern => pattern._id}
					itemComponent={EventsDetailPatternsMenuItem}
					maxHeight={500}
					title={t('default:events.ruleEditor.patterns')}
				/>
			)}
		</Menu>
	);
}
