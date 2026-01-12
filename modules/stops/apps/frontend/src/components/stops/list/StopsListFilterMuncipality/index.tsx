'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const stopsListContext = useStopsListContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!locationsContext.data.municipalities?.length) return [];
		return locationsContext.data.municipalities.map(item => ({
			label: item.name,
			value: item._id,
		}));
	}, [locationsContext.data.municipalities]);

	//
	// C. Render components

	return (
		<MultiSelect
			data={parsedOptions}
			label={t('stops:stops.list.StopsListFilterMunicipality.label')}
			onChange={stopsListContext.actions.setFilterMunicipalities}
			value={stopsListContext.filters.municipalities}
			clearable
		/>
	);

	//
}
