/* * */

import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { useAlertListContext } from '@/contexts/AlertList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AlertsListHeader() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertListContext();
	const alertCreateContext = useAlertCreateContext();
	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Alertas</Label>
			<Spacer />
			<SearchInput onChange={alertsListContext.actions.setFilterSearch} value={alertsListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label="Novo Alerta" onClick={alertCreateContext.modal.open} />
		</Toolbar>
	);

	//
}
