/* * */

import { TagFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterLine } from './use-rides-list-filter-line';

/* * */

export function RidesListFilterLine() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterLine = useRidesListFilterLine();

	//
	// B. Render components

	return (
		<TagFilter
			active={filterLine.isActive}
			label={t('default:list.RidesListFilterLine.label')}
			onChange={filterLine.set}
			value={filterLine.value}
		/>
	);
}
