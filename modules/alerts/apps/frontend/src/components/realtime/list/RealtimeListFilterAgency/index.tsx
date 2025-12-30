/* * */

import { useRealtimeListContext } from '@/components/realtime/list/RealtimeList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RealtimeListFilterAgency() {
	//

	//
	// A. Setup variables

	const realtimeListContext = useRealtimeListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={realtimeListContext.filters.agency.isActive}
			label="Operador"
			onChange={realtimeListContext.filters.agency.set}
			options={realtimeListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
