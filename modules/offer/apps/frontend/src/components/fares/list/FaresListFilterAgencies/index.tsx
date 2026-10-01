/* * */

import { useFaresListContext } from '@/components/fares/list/FaresList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function FaresListFilterAgencies() {
	//

	//
	// A. Setup variables

	const annotationsListContext = useFaresListContext();

	//
	// B. Render components

	return (
		<ListFilter
			active={annotationsListContext.filters.agencies.isActive}
			label="Operadores"
			onChange={annotationsListContext.filters.agencies.set}
			options={annotationsListContext.filters.agencies.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
