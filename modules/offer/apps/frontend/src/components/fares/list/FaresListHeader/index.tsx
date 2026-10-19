/* * */

import { openCreateFareModal } from '@/components/fares/create/FareCreate.modal';
import { useFaresListContext } from '@/components/fares/list/FaresList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, ListHeader, SearchField } from '@tmlmobilidade/ui';

/* * */

export function FaresListHeader() {
	//

	//
	// A. Setup variables

	const faresListContext = useFaresListContext();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<Button disabled={!faresListContext.flags.canCreate} label="Nova tarifa" leftSection={<IconPlus />} onClick={openCreateFareModal} />}
			count={faresListContext.data.filtered.length}
			search={<SearchField onChange={faresListContext.filters.search.set} value={faresListContext.filters.search.value} />}
			title="Tarifas"
		/>
	);

	//
}
