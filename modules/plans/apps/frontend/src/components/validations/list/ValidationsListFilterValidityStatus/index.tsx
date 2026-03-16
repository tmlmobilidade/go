/* * */

import { useValidationsListContext } from '@/components/validations/list/ValidationsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListFilterValidityStatus() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={validationsListContext.filters.validity_status.isActive}
			label="Resultado"
			onChange={validationsListContext.filters.validity_status.set}
			options={validationsListContext.filters.validity_status.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
