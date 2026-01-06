'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsListFilterDistrict() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const stopsListContext = useStopsListContext();
	const { t } = useTranslation('stops');

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!locationsContext.data.districts?.length) return [];
		return locationsContext.data.districts.map(item => ({
			label: item.name,
			value: item._id,
		}));
	}, [locationsContext.data.districts]);

	//
	// C. Render components

	return (
		<MultiSelect
			data={parsedOptions}
			label={t('stops.list.FilterBar.FilterDistrict.label')}
			onChange={stopsListContext.actions.setFilterDistricts}
			value={stopsListContext.filters.districts}
			clearable
		/>
	);

	//
}
