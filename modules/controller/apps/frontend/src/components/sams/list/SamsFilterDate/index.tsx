/* * */

import { useSamsListContext } from '@/contexts/SamsList.context';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsFiltersDate() {
	//
	// A. Setup variables

	const samsListContext = useSamsListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<FilterTypeDateRange
			active={samsListContext.filters.seen_last_at != null || samsListContext.filters.seen_first_at != null}
			disabled={samsListContext.flags.favoritesEnabled}
			endDate={samsListContext.filters.seen_last_at as UnixTimestamp}
			label={t('default:sams.list.SamsFiltersDate.label')}
			onEndDateChange={samsListContext.actions.setFilterSeenLastAt}
			onStartDateChange={samsListContext.actions.setFilterSeenFirstAt}
			startDate={samsListContext.filters.seen_first_at as UnixTimestamp}
			clearable
		/>
	);
}
