/* * */

import { useTypologiesListContext } from '@/components/typologies/list/TypologiesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function TypologiesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const typologiesListContext = useTypologiesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={typologiesListContext.filters.agencies.isActive}
			label="Operadores"
			onChange={typologiesListContext.filters.agencies.set}
			options={typologiesListContext.filters.agencies.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
