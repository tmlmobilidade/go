/* * */

import { useStopListContext } from '@/contexts/StopList.context';
import { Translations } from '@/lib/translations';
import { connectionsSchema } from '@tmlmobilidade/types';
import { FilterMenu } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopListFilterConnections() {
	//

	//
	// A. Setup variables

	const stopListContext = useStopListContext();

	const connectionsValues = connectionsSchema.options.map (value => ({
		label: Translations.CONNECTIONS[value],
		value: value,
	}));

	//
	// B. Transform data

	const parsedOptions = useMemo(() => {
		if (!stopListContext) return [];

		return connectionsValues;
	}, [connectionsValues]);

	//
	// C. Render components

	return (
		<FilterMenu
			label="conexões"
			// onChange={stopListContext.data.filtered}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
