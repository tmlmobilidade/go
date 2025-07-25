/* * */

import { useStopListContext } from '@/contexts/StopList.context';
import { Translations } from '@/lib/translations';
import { equipmentSchema } from '@tmlmobilidade/types';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterEquipment() {
	//

	//
	// A. Setup variables

	const stopListContext = useStopListContext();

	const equipmentValues = equipmentSchema.options.map (value => ({
		label: Translations.EQUIPMENT[value],
		value: value,
	}));

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!stopListContext) return [];

		return equipmentValues;
	}, [equipmentValues]);

	//
	// C. Render components

	return (
		<FilterMenu
			label="Equipamentos"
			// onChange={stopListContext.data.filtered}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
