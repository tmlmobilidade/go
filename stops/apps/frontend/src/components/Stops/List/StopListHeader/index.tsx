/* * */

import { useStopListContext } from '@/contexts/StopList.context';
// import { Routes } from '@/lib/routes';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Label, SegmentedControl, Spacer, TextInput } from '@tmlmobilidade/ui';
// import Link from 'next/link';

/* * */

export function StopListHeader() {
	//

	//
	// A. Setup variables

	const stoplistcontext = useStopListContext();

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps>Paragens</Label>
			<Spacer />
			<TextInput
				leftSection={<IconSearch size={20} />}
				miw={400}
				onChange={e => stoplistcontext.actions.changeSearchQuery(e.target.value)}
				placeholder="Pesquisar alerta"
			/>
			{/* <Link> */}
			<Button label="Nova Paragem" leftSection={<IconPlus size={20} />} />
			{/* </Link> */}
			<div>
				<SegmentedControl data={['Planeados', 'Tempo Real']} size="md" />
			</div>
		</>
	);

	//
}
