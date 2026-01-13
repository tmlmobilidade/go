/* * */

import { useValidationsListContext } from '@/components/validations/list/ValidationsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsListFilterProcessingStatus() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={validationsListContext.filters.processing_status.isActive}
			label={t('plans:validations.list.ValidationsListFilterProcessingStatus.label')}
			onChange={validationsListContext.filters.processing_status.set}
			options={validationsListContext.filters.processing_status.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
