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

	const facilitiesValues = facilitiesSchema.options.map (value => ({
		label: Translations.FACILITIES[value],
		value: value,
	}));

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!stopListContext) return [];

		return facilitiesValues;
	}, [facilitiesValues]);

	//
	// C. Render components

	return (
		<FilterMenu
			label="Serviços"
			// onChange={stopListContext.data.filtered}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
