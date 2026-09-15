/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useHolidaysListFilterAgencies } from './use-holidays-list-filter-agencies';

/* * */

export function HolidaysListFilterAgencies() {
	//

	//
	// A. Setup variables

	const filterAgencies = useHolidaysListFilterAgencies();

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
