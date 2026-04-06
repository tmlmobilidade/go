/* * */

import { useSamsListContext } from '@/contexts/SamsList.context';

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsFilterStatus() {
	//
	// A. Setup variables

	const samsListContext = useSamsListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={samsListContext.filters.status.isActive}
			label={t('default:sams.list.SamsFiltersStatus.label')}
			onChange={samsListContext.filters.status.set}
			options={samsListContext.filters.status.options}
			isMultiple
			withToggleAll
		/>
	);
}