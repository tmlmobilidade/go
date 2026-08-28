/* * */

import { useSamsListContext } from '@/contexts/SamList.context';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { DateRangeFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsFiltersDate() {
	//
	// A. Setup variables

	const { t } = useTranslation();

	const samsListContext = useSamsListContext();

	//
	// B. Render components

	return (
		<DateRangeFilter
			active={samsListContext.filters.seen_last_at != null || samsListContext.filters.seen_first_at != null}
			disabled={samsListContext.flags.favoritesEnabled}
			endDate={samsListContext.filters.seen_last_at as UnixMilliseconds}
			label={t('default:sams.list.SamsFiltersDate.label')}
			onEndDateChange={samsListContext.actions.setFilterSeenLastAt}
			onStartDateChange={samsListContext.actions.setFilterSeenFirstAt}
			startDate={samsListContext.filters.seen_first_at as UnixMilliseconds}
			clearable
		/>
	);
}
