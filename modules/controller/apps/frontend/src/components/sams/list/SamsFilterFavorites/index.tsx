/* * */

/* * */

import { useSamsListContext } from '@/contexts/SamsList.context';
import { FilterTarget } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsFilterFavorites() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const samsListContext = useSamsListContext();

	//
	// B. Render components

	return (
		<FilterTarget
			active={samsListContext.flags.favoritesEnabled}
			disabled={samsListContext.flags.loading}
			label={t('default:sams.list.SamsListFilterFavorites.label')}
			onClick={() => {
				samsListContext.actions.setFavoritesEnabled();
			}}
		/>
	);
}
