/* * */

import { useRealtimeListContext } from '@/components/realtime/list/RealtimeList.context';
import { IconPlus } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

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
			<Button href={PAGE_ROUTES.alerts.REALTIME_DETAIL('new')} label="Novo alerta" leftSection={<IconPlus size={20} />} />
		</Toolbar>
	);

	//
}
