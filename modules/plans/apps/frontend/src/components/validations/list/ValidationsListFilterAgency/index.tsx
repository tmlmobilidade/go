/* * */

import { useValidationsListContext } from '@/components/validations/list/ValidationsList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListFilterAgency() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();

	//
	// B. Render components

	return (
		<ListFilter
			active={validationsListContext.filters.agency.isActive}
			label="Operador"
			onChange={validationsListContext.filters.agency.set}
			options={validationsListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
