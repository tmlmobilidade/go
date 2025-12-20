/* * */

import { openCreateScheduledAlertModal } from '@/components/scheduled/create/ScheduledAlertCreate.modal';
import { useScheduledListContext } from '@/components/scheduled/list/ScheduledList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ScheduledListHeader() {
	//

	//
	// A. Setup variables

	const scheduledListContext = useScheduledListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Alertas</Label>
			<Spacer />
			<SearchInput onChange={scheduledListContext.actions.setFilterSearch} value={scheduledListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label="Novo Alerta" onClick={openCreateScheduledAlertModal} />
		</Toolbar>
	);

	//
}
