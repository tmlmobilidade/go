/* * */

import { useValidationsListContext } from '@/components/validations/list/ValidationsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsListFilterAgency() {
	//

	//
	// A. Setup variables

	const validationsListContext = useValidationsListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={validationsListContext.filters.agency.isActive}
			label={t('plans:validations.list.ValidationsListFilterAgency.label')}
			onChange={validationsListContext.filters.agency.set}
			options={validationsListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
