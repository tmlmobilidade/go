/* * */

import { usePeriodsListContext } from '@/components/year-periods/list/PeriodsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function PeriodsListFilterAgency() {
	//

	//
	// A. Setup variables

	const periodsListContext = usePeriodsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={periodsListContext.filters.agency.isActive}
			label="Operador"
			onChange={periodsListContext.filters.agency.set}
			options={periodsListContext.filters.agency.options}
			withToggleAll
		/>
	);

	//
}
