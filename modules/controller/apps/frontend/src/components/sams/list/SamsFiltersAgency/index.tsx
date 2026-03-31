/* * */

import { useSamsListContext } from '@/contexts/SamsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsFiltersAgency() {

    //
    // A. Setup variables

    const samsListContext = useSamsListContext();
    const { t } = useTranslation();

    //
    // B. Render components

	return (
		<FilterTypeList
			active={samsListContext.filters.agency.isActive}
			label={t('default:sams.list.SamsFiltersAgency.label')}
			onChange={samsListContext.filters.agency.set}
			options={samsListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);
}