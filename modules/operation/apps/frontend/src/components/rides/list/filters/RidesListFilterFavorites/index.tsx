/* * */

import { ToggleFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterFavorites } from './use-rides-list-filter-favorites';

/* * */

export function RidesListFilterFavorites() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterFavorites = useRidesListFilterFavorites();

	//
	// B. Render components

	return (
		<ToggleFilter
			active={filterFavorites.value}
			label={t('default:list.RidesList.columns.favorites.label')}
			onToggle={filterFavorites.toggle}
		/>
	);
}
