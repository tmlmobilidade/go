/* * */

import { useAlertListContext } from '@/contexts/AlertList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Label, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AlertsListHeader() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps singleLine>Alertas</Label>
			<Spacer />
			<TextInput
				leftSection={<IconSearch size={20} />}
				onChange={e => alertsListContext.actions.setFilterSearch(e.target.value)}
				placeholder="Pesquisar..."
				value={alertsListContext.filters.search}
			/>
			<Button href={Routes.ALERT_DETAIL('new')} label="Novo alerta" leftSection={<IconPlus size={20} />} />
		</>
	);

	//
}
