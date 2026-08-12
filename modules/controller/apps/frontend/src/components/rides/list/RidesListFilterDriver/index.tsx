/* * */

import { TextFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterDriver } from './use-rides-list-filter-driver';

/* * */

export function RidesListFilterDriver() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterDriver = useRidesListFilterDriver();

	//
	// B. Render components

	return (
		<TextFilter
			active={filterDriver.isActive}
			label={t('default:list.RidesListFilterDriver.label')}
			onChange={filterDriver.set}
			value={filterDriver.value}
		/>
	);
}
