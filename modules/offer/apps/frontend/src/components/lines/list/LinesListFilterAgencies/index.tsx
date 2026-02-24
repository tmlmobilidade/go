/* * */

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function LinesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const linesListContext = useLinesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={linesListContext.filters.agencies.isActive}
			label="Operadores"
			onChange={linesListContext.filters.agencies.set}
			options={linesListContext.filters.agencies.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
