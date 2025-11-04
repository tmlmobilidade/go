/* * */

import { useAlertListContext } from '@/contexts/AlertList.context';
import { Routes } from '@/lib/routes';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AlertsListHeader() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Alertas</Label>
			<Spacer />
			<SearchInput onChange={alertsListContext.actions.setFilterSearch} value={alertsListContext.filters.search} />
			<Button href={Routes.ALERT_DETAIL('new')} label="Novo alerta" leftSection={<IconPlus size={20} />} />
		</Toolbar>
	);

	//
}
