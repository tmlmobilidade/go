/* * */

import { openCreateFareModal } from '@/components/fares/create/FareCreate.modal';
import { useFaresListContext } from '@/components/fares/list/FaresList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function FaresListHeader() {
	//

	//
	// A. Setup variables

	const faresListContext = useFaresListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Tarifas</Label>
			<Spacer />
			<SearchInput onChange={faresListContext.filters.search.set} value={faresListContext.filters.search.value} />
			<Button disabled={!faresListContext.flags.canCreate} label="Nova tarifa" leftSection={<IconPlus />} onClick={openCreateFareModal} />
		</Toolbar>
	);

	//
}
