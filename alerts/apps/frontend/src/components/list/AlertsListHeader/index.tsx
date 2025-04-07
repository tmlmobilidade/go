/* * */

import { useAlertListContext } from '@/contexts/AlertList.context';
import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Label, SegmentedControl, Spacer, TextInput } from '@tmlmobilidade/ui';
import Link from 'next/link';

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
			<Label size="lg" caps>Alertas</Label>
			<Spacer />
			<TextInput
				leftSection={<IconSearch size={20} />}
				miw={400}
				onChange={e => alertsListContext.actions.changeSearchQuery(e.target.value)}
				placeholder="Pesquisar alerta"
				value={alertsListContext.filters.searchQuery}
			/>
			<Link href={Routes.ALERT_DETAIL('new')}>
				<Button label="Novo alerta" leftSection={<IconPlus size={20} />} />
			</Link>
			<div>
				<SegmentedControl data={['Planeados', 'Tempo Real']} size="md" />
			</div>
		</>
	);

	//
}
