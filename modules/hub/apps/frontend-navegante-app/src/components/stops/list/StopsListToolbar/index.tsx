'use client';

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { SegmentedControl } from '@mantine/core';
import { SearchInput, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsListToolbar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const stopsListContext = useStopsListContext();

	//
	// B. Transform data

	const currentViewOptions = [
		{ label: t('default:stops.StopsListToolbar.by_current_view.map'), value: 'map' },
		{ label: t('default:stops.StopsListToolbar.by_current_view.list'), value: 'list' },
	];

	//
	// C. Render components

	return (
		<Section>
			<SearchInput onChange={stopsListContext.filters.search.set} value={stopsListContext.filters.search.value} />
			<SegmentedControl data={currentViewOptions} onChange={stopsListContext.view.toggle} value={stopsListContext.view.current} w="100%" fullWidth />
		</Section>
	);
}
