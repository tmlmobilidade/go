/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useAnnotationsListFilterAgencies } from './use-annotations-list-filter-agencies';

/* * */

export function AnnotationsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const filterAgencies = useAnnotationsListFilterAgencies();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAgencies.isActive}
			label="Operadores"
			onChange={filterAgencies.set}
			options={filterAgencies.options}
			isMultiple
			withToggleAll
		/>
	);
}
