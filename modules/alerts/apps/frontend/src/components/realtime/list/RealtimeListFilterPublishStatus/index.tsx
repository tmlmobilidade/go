/* * */

import { useRealtimeListContext } from '@/components/realtime/list/RealtimeList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RealtimeListFilterPublishStatus() {
	//

	//
	// A. Setup variables

	const realtimeListContext = useRealtimeListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={realtimeListContext.filters.publish_status.isActive}
			label="Estado"
			onChange={realtimeListContext.filters.publish_status.set}
			options={realtimeListContext.filters.publish_status.options}
			withToggleAll
		/>
	);

	//
}
