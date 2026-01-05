/* * */

import { openCreateTypologyModal } from '@/components/typologies/create/TypologyCreate.modal';
import { useTypologiesListContext } from '@/components/typologies/list/TypologiesList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function TypologiesListHeader() {
	//

	//
	// A. Setup variables

	const typologiesListContext = useTypologiesListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Tipologias</Label>
			<Spacer />
			<SearchInput onChange={typologiesListContext.filters.search.set} value={typologiesListContext.filters.search.value} />
			<Button disabled={!typologiesListContext.flags.canCreate} label="Nova tipologia" leftSection={<IconPlus />} onClick={openCreateTypologyModal} />
		</Toolbar>
	);

	//
}
