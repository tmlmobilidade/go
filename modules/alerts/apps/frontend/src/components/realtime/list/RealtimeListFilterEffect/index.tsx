/* * */

import { useRealtimeListContext } from '@/components/realtime/list/RealtimeList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RealtimeListFilterEffect() {
	//

	//
	// A. Setup variables

	const realtimeListContext = useRealtimeListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={realtimeListContext.filters.effect.isActive}
			label="Efeito"
			onChange={realtimeListContext.filters.effect.set}
			options={realtimeListContext.filters.effect.options}
			withToggleAll
		/>
	);

	//
}
