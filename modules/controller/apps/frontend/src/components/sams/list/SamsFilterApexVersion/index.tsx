/* * */

import { useSamsListContext } from '@/contexts/SamList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsFiltersApexVersion() {
	//
	// A. Setup variables

	const { t } = useTranslation();

	const samsListContext = useSamsListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={samsListContext.filters.apex_version.isActive}
			disabled={samsListContext.flags.favoritesEnabled}
			label={t('default:sams.list.SamsFiltersApexVersion.label')}
			onChange={samsListContext.filters.apex_version.set}
			options={samsListContext.filters.apex_version.options}
			isMultiple
			withToggleAll
		/>
	);
}
