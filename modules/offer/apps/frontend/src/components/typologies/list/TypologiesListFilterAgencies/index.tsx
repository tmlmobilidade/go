/* * */

import { useTypologiesListContext } from '@/components/typologies/list/TypologiesList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function TypologiesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const typologiesListContext = useTypologiesListContext();

	//
	// B. Render components

	return (
		<ListFilter
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
