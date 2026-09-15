/* * */

import { ListFilter } from '@tmlmobilidade/ui';

import { useYearPeriodsListFilterAgency } from './use-year-periods-list-filter-agency';

/* * */

export function YearPeriodsListFilterAgency() {
	//

	//
	// A. Setup variables

	const filterAgency = useYearPeriodsListFilterAgency();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAgency.isActive}
			label="Operador"
			onChange={filterAgency.set}
			options={filterAgency.options}
			withToggleAll
		/>
	);
}
