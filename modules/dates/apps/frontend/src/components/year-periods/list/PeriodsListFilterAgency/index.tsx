/* * */

import { usePeriodsListContext } from '@/components/year-periods/list/PeriodsList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function PeriodsListFilterAgency() {
	//

	//
	// A. Setup variables

	const periodsListContext = usePeriodsListContext();

	//
	// B. Render components

	return (
		<ListFilter
			active={periodsListContext.filters.agency.isActive}
			label="Operador"
			onChange={periodsListContext.filters.agency.set}
			options={periodsListContext.filters.agency.options}
			withToggleAll
		/>
	);

	//
}
