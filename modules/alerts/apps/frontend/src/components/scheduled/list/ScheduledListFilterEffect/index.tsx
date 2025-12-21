/* * */

import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function ScheduledListFilterEffect() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={scheduledListContext.filters.effect.isActive}
			label="Efeito"
			onChange={scheduledListContext.filters.effect.set}
			options={scheduledListContext.filters.effect.options}
			withToggleAll
		/>
	);

	//
}
