'use client';

import { FoundItemsCounter } from '@/components/layout/FoundItemsCounter';
import { Grid } from '@/components/layout/Grid';
import { SegmentedControl, TextInput } from '@mantine/core';
import { IconArrowLoopRight } from '@tabler/icons-react';
import { Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListContext } from '../StopsList.context';

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
	// C. Handle actions

	const handleTextInputChange = ({ currentTarget }) => {
		stopsListContext.actions.updateFilterBySearch(currentTarget.value);
	};

	//
	// D. Render components

	return (
		<Section>
			<SegmentedControl data={currentViewOptions} onChange={stopsListContext.actions.updateFilterByCurrentView} value={stopsListContext.filters.by_current_view} w="100%" fullWidth />
			{(stopsListContext.filters.by_current_view === 'list' || stopsListContext.filters.by_current_view === 'map') && (
				<Grid columns="ab" withGap>
					<TextInput leftSection={<IconArrowLoopRight size={20} />} onChange={handleTextInputChange} placeholder={t('default:stops.StopsListToolbar.by_search.placeholder')} type="search" value={stopsListContext.filters.by_search} w="100%" />
					{/* <FilterByAgency /> */}
					<FoundItemsCounter text={t('default:stops.StopsListToolbar.found_items_counter.all', { count: stopsListContext.data.filtered.length })} />
				</Grid>
			)}
		</Section>
	);

	//
}
