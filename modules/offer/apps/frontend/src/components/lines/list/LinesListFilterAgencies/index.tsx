/* * */

import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function LinesListFilterAgencies() {
	//

	//
	// A. Setup variables

	const linesListContext = useLinesListContext();

	//
	// B. Render components

	return (
		<ListFilter
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
