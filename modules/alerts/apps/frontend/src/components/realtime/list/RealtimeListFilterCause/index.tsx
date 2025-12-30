/* * */

import { useRealtimeListContext } from '@/components/realtime/list/RealtimeList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RealtimeListFilterCause() {
	//

	//
	// A. Setup variables

	const realtimeListContext = useRealtimeListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={realtimeListContext.filters.cause.isActive}
			label="Causa"
			onChange={realtimeListContext.filters.cause.set}
			options={realtimeListContext.filters.cause.options}
			withToggleAll
		/>
	);

	//
}
