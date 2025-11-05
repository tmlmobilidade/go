/* * */

import { useRealtimeListContext } from '@/contexts/RealtimeList.context';
import { Routes } from '@/lib/routes';
import { IconPlus } from '@tabler/icons-react';
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
			<Label size="lg" caps singleLine>Alertas - Tempo Real</Label>
			<Spacer />
			<SearchInput onChange={realtimeListContext.actions.setFilterSearch} value={realtimeListContext.filters.search} />
			<Button href={Routes.REALTIME_LIST} label="Novo alerta" leftSection={<IconPlus size={20} />} />
		</Toolbar>
	);

	//
}
