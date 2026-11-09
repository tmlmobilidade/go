'use client';

import { IconAlertTriangle, IconLoader2, IconRoute, IconRouteOff } from '@tabler/icons-react';
import { type EventsPatternsResponse } from '@tmlmobilidade/go-offer-pckg-types';
import { Menu, MenuList, MenuNoContent } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { EventsDetailPatternsMenuItem } from '../EventsDetailPatternsMenuItem';

/* * */

interface EventsDetailPatternsMenuProps {
	error: null | string
	isLoading: boolean
	patterns: EventsPatternsResponse
}

/* * */

export function EventsDetailPatternsMenu({ error, isLoading, patterns }: EventsDetailPatternsMenuProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const hasPatterns = !isLoading && !error && patterns.length > 0;

	//
	// B. Render components

	let emptyState = { icon: IconRouteOff, text: t('events:detail.EventsDetailPatternsMenu.no_patterns') };
	if (isLoading) {
		emptyState = { icon: IconLoader2, text: t('events:detail.EventsDetailPatternsMenu.loading') };
	} else if (error) {
		emptyState = { icon: IconAlertTriangle, text: t('events:detail.EventsDetailPatternsMenu.error') };
	}

	return (
		<Menu
			counter={isLoading || error ? undefined : patterns.length}
			icon={IconRoute}
			label={t('events:detail.EventsDetailPatternsMenu.view_patterns')}
			variant="primary"
			width={320}
		>
			{hasPatterns ? (
				<MenuList
					data={patterns}
					getItemKey={pattern => pattern._id}
					itemComponent={EventsDetailPatternsMenuItem}
					maxHeight={500}
					title={t('events:detail.EventsDetailPatternsMenu.patterns')}
				/>
			) : (
				<MenuNoContent {...emptyState} />
			)}
		</Menu>
	);
}
