/* * */

import { useStopListContext } from '@/contexts/StopList.context';
import { Translations } from '@/lib/translations';
import { facilitiesSchema } from '@tmlmobilidade/types';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterFacilities() {
	//

	//
	// A. Setup variables

	const stopListContext = useStopListContext();

	//
	// B. Transform data

	const isActive = useMemo(() => {
		const defaultValues = Array.from(facilitiesSchema.options) as string[];
		const enabledValues = stopListContext.filters.Facilities;

		if (defaultValues.length !== enabledValues.length) return true;

		return !defaultValues.every(item => enabledValues.includes(item));
	}, [stopListContext.filters.Facilities]);

	const parsedOptions = useMemo(() => {
		if (!facilitiesSchema.options?.length) return [];

		return facilitiesSchema.options.map(item => ({
			checked: stopListContext.filters.Facilities.includes(item),
			label: Translations.FACILITIES[item],
			value: item,
		}));
	}, [stopListContext.filters.Facilities]);

	//
	// C. Render components

	return (
		<FilterMenu
			active={isActive}
			label="Serviços"
			onChange={stopListContext.actions.setFilterFacilities}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
