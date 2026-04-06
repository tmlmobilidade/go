/* * */

import { useSamsListContext } from "@/contexts/SamsList.context";
import { UnixTimestamp } from "@tmlmobilidade/types";
import { FilterTypeDateRange } from "@tmlmobilidade/ui";
import { useTranslation } from "react-i18next";

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
			label={t('default:sams.list.SamsFiltersDate.label')}
			startDate={samsListContext.filters.seen_first_at as UnixTimestamp}
			endDate={samsListContext.filters.seen_last_at as UnixTimestamp}
			onStartDateChange={samsListContext.actions.setFilterSeenFirstAt}
			onEndDateChange={samsListContext.actions.setFilterSeenLastAt}
		/>
	);
}