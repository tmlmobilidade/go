/* * */

import { useSamsListContext } from '@/contexts/SamList.context';
import { ListFilter } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsFiltersAgency() {
	//
	// A. Setup variables

	const { t } = useTranslation();

	const samsListContext = useSamsListContext();

	const agencyOptionsById = useMemo(
		() =>
			[...samsListContext.filters.agency.options].sort((a, b) =>
				a.value.localeCompare(b.value, undefined, { numeric: true }),
			),
		[samsListContext.filters.agency.options],
	);

	//
	// B. Render components

	return (
		<ListFilter
			active={samsListContext.filters.agency.isActive}
			disabled={samsListContext.flags.favoritesEnabled}
			label={t('default:sams.list.SamsListFilterAgency.label')}
			onChange={samsListContext.filters.agency.set}
			options={agencyOptionsById}
			isMultiple
			withToggleAll
		/>
	);
}
