/* * */

import { useHolidaysListContext } from '@/components/holidays/list/HolidaysList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function HolidaysListFilterAgencies() {
	//

	//
	// A. Setup variables

	const holidaysListContext = useHolidaysListContext();

	//
	// B. Render components

	return (
		<ListFilter
			active={holidaysListContext.filters.agency.isActive}
			label="Operadores"
			onChange={holidaysListContext.filters.agency.set}
			options={holidaysListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
