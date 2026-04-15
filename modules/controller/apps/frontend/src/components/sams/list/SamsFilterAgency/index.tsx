/* * */

import { useSamsListContext } from '@/contexts/SamsList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsFiltersAgency() {
	//
	// A. Setup variables

	const { t } = useTranslation();

	const samsListContext = useSamsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={samsListContext.filters.agency.isActive}
			disabled={samsListContext.flags.favoritesEnabled}
			label={t('default:sams.list.SamsListFilterAgency.label')}
			onChange={samsListContext.filters.agency.set}
			options={samsListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);
}
