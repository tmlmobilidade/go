/* * */

import { TagFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterLegacyId } from './use-stops-list-filter-legacy-id';

/* * */

export function StopsListFilterLegacyId() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterLegacyId = useStopsListFilterLegacyId();

	//
	// B. Render components

	return (
		<TagFilter
			active={filterLegacyId.isActive}
			label={t('default:stops.list.FilterLegacyId.label')}
			onChange={filterLegacyId.set}
			value={filterLegacyId.value}
		/>
	);
}
