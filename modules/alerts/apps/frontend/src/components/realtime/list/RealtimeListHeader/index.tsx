/* * */

import { useRealtimeListContext } from '@/components/realtime/list/RealtimeList.context';
import { Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RealtimeListHeader() {
	//

	//
	// A. Setup variables

	const realtimeListContext = useRealtimeListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Alertas em Tempo Real</Label>
			<Spacer />
			<SearchInput onChange={realtimeListContext.filters.search.set} value={realtimeListContext.filters.search.value} />
		</Toolbar>
	);

	//
}
