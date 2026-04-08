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
	const getStatusLabel = (value: string) => {
		if (value === 'complete') return t('default:sams.list.SamsFiltersStatus.options.complete');
		if (value === 'error') return t('default:sams.list.SamsFiltersStatus.options.error');
		if (value === 'incomplete') return t('default:sams.list.SamsFiltersStatus.options.incomplete');
		if (value === 'waiting') return t('default:sams.list.SamsFiltersStatus.options.waiting');
		return value;
	};

	//
	// B. Render components

	return (
		<FilterTypeList
			active={samsListContext.filters.status.isActive}
			label={t('default:sams.list.SamsFiltersStatus.label')}
			onChange={samsListContext.filters.status.set}
			options={samsListContext.filters.status.options.map(option => ({
				label: getStatusLabel(option.value),
				value: option.value,
			}))}
			isMultiple
			withToggleAll
		/>
	);
}
