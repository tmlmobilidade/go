'use client';

/* * */

import { DetailNavigation, type DetailNavigationItem } from '@/components/common/DetailNavigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface LineDetailNavigationProps {
	lineId: string
}

/* * */

export function LineDetailNavigation({ lineId }: LineDetailNavigationProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const items = useMemo<DetailNavigationItem[]>(() => [
		{
			href: `/network/lines/${lineId}`,
			id: 'overview',
			label: t('lineDetail.navigation.overview'),
		},
		{ id: 'demand', label: t('lineDetail.navigation.demand') },
		{ id: 'offer', label: t('lineDetail.navigation.offer') },
		{ id: 'service', label: t('lineDetail.navigation.service') },
		{ id: 'reliability', label: t('lineDetail.navigation.reliability') },
		{ id: 'patterns', label: t('lineDetail.navigation.patterns') },
		{ id: 'data', label: t('lineDetail.navigation.data') },
	], [lineId, t]);

	//
	// B. Render components

	return (
		<DetailNavigation
			activeItemId="overview"
			ariaLabel={t('lineDetail.navigation.ariaLabel')}
			items={items}
		/>
	);

	//
}
