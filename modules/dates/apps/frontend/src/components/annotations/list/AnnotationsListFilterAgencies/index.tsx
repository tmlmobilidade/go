/* * */

import { useAnnotationsListContext } from '@/components/annotations/list/AnnotationsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AnnotationsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const annotationsListContext = useAnnotationsListContext();
	const { t } = useTranslation('dates');

	//
	// B. Render components

	return (
		<FilterTypeList
			active={annotationsListContext.filters.agency.isActive}
			label={t('annotations.list.FilterBar.agency.label')}
			onChange={annotationsListContext.filters.agency.set}
			options={annotationsListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
