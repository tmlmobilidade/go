/* * */

import { openCreateScheduledAlertModal } from '@/components/scheduled/create/ScheduledAlertCreate.modal';
import { useAlertsListContext } from '@/components/scheduled/list/AlertsList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AlertsListHeader() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Alertas</Label>
			<Spacer />
			<SearchInput onChange={alertsListContext.actions.setFilterSearch} value={alertsListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label="Novo Alerta" onClick={openCreateScheduledAlertModal} />
		</Toolbar>
	);

	//
}
