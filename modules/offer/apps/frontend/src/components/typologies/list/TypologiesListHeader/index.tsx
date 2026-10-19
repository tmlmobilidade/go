/* * */

import { openCreateTypologyModal } from '@/components/typologies/create/TypologyCreate.modal';
import { useTypologiesListContext } from '@/components/typologies/list/TypologiesList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, ListHeader, SearchField } from '@tmlmobilidade/ui';

/* * */

export function TypologiesListHeader() {
	//

	//
	// A. Setup variables

	const typologiesListContext = useTypologiesListContext();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<Button disabled={!typologiesListContext.flags.canCreate} label="Nova tipologia" leftSection={<IconPlus />} onClick={openCreateTypologyModal} />}
			count={typologiesListContext.data.filtered.length}
			search={<SearchField onChange={typologiesListContext.filters.search.set} value={typologiesListContext.filters.search.value} />}
			title="Tipologias"
		/>
	);

	//
}
