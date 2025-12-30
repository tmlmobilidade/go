/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsListFilterParish() {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const stopsListContext = useStopsListContext();
	const { t } = useTranslation('stops', { keyPrefix: 'list.filters' });

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!locationsContext.data.parishes?.length) return [];
		return locationsContext.data.parishes.map(item => ({
			label: item.name,
			value: item._id,
		}));
	}, [locationsContext.data.parishes]);

	//
	// C. Render components

	return (
		<MultiSelect
			data={parsedOptions}
			label={t('parish')}
			onChange={stopsListContext.actions.setFilterParishes}
			value={stopsListContext.filters.parishes}
			clearable
		/>
	);

	//
}
