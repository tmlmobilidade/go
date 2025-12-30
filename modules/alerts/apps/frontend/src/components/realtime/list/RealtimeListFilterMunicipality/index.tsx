/* * */

import { useRealtimeListContext } from '@/components/realtime/list/RealtimeList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RealtimeListFilterMunicipality() {
	//

	//
	// A. Setup variables

	const realtimeListContext = useRealtimeListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={realtimeListContext.filters.municipality.isActive}
			label="Município"
			onChange={realtimeListContext.filters.municipality.set}
			options={realtimeListContext.filters.municipality.options}
			withToggleAll
		/>
	);

	//
}
