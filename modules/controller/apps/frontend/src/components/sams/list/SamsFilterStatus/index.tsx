/* * */

import { useSamsListContext } from '@/contexts/SamsList.context';
import { translateFilterValue } from '@/lib/translations';
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
			options={samsListContext.filters.status.options.map(option => ({
				...option,
				label: translateFilterValue('sams_status', option.value),
			}))}
			isMultiple
			withToggleAll
		/>
	);
}
