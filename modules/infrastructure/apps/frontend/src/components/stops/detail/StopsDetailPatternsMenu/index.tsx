'use client';

import { IconAlertTriangle, IconLoader2, IconRoute, IconRouteOff } from '@tabler/icons-react';
import { Menu, MenuList, MenuNoContent } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { StopsDetailPatternsMenuItem } from '../StopsDetailPatternsMenuItem';
import { useStopsDetailPatternsData } from '../use-stops-detail-patterns-data';

/* * */

export function StopsDetailPatternsMenu() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: patterns, error, isLoading } = useStopsDetailPatternsData();
	const hasPatterns = !isLoading && !error && patterns.length > 0;

	//
	// B. Render components

	let emptyState = { icon: IconRouteOff, text: t('stops:detail.StopsDetailPatternsMenu.no_patterns') };
	if (isLoading) {
		emptyState = { icon: IconLoader2, text: t('stops:detail.StopsDetailPatternsMenu.loading') };
	} else if (error) {
		emptyState = { icon: IconAlertTriangle, text: t('stops:detail.StopsDetailPatternsMenu.error') };
	}

	return (
		<Menu
			counter={isLoading || error ? undefined : patterns.length}
			icon={IconRoute}
			label={t('stops:detail.StopsDetailPatternsMenu.view_patterns')}
			variant="primary"
			width={320}
		>
			{hasPatterns ? (
				<MenuList
					data={patterns}
					getItemKey={pattern => pattern._id}
					itemComponent={StopsDetailPatternsMenuItem}
					maxHeight={500}
					title={t('stops:detail.StopsDetailPatternsMenu.patterns')}
				/>
			) : (
				<MenuNoContent {...emptyState} />
			)}
		</Menu>
	);
}
