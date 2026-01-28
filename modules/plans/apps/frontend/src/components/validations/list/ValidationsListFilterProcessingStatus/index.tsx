/* * */

import { useValidationsListContext } from '@/components/validations/list/ValidationsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListFilterProcessingStatus() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={validationsListContext.filters.processing_status.isActive}
			label="Estado"
			onChange={validationsListContext.filters.processing_status.set}
			options={validationsListContext.filters.processing_status.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
