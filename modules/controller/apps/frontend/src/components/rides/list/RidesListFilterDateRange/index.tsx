/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { FilterTypeDateRange } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterDateRange() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Handle actions

	const handleStartDateChange = (value: UnixTimestamp) => {
		ridesListContext.actions.setFilterDateStart(value);
	};

	const handleEndDateChange = (value: UnixTimestamp) => {
		ridesListContext.actions.setFilterDateEnd(value);
	};

	//
	// C. Render components

	return (
		<FilterTypeDateRange
			active={true}
			endDate={ridesListContext.filters.date_end as UnixTimestamp}
			label={t('default:list.RidesListFilterDateRange.label')}
			onEndDateChange={handleEndDateChange}
			onStartDateChange={handleStartDateChange}
			startDate={ridesListContext.filters.date_start as UnixTimestamp}
			thirdOption={false}
		/>
	);

	//
}
