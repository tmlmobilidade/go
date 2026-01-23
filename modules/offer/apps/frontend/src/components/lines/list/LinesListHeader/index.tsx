'use client';

/* * */

import { openCreateLineModal } from '@/components/lines/create/LineCreate.modal';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function LinesListHeader() {
	//

	//
	// A. Setup variables

	const linesListContext = useLinesListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Linhas</Label>
			<Spacer />
			<SearchInput onChange={linesListContext.filters.search.set} value={linesListContext.filters.search.value} />
			<Button disabled={!linesListContext.flags.canCreate} label="Nova linha" leftSection={<IconPlus />} onClick={openCreateLineModal} />
		</Toolbar>
	);

	//
}
