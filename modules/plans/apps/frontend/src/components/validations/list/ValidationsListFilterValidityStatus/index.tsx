/* * */

import { useValidationsListContext } from '@/components/validations/list/ValidationsList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListFilterValidityStatus() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();

	//
	// B. Render components

	return (
		<ListFilter
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
