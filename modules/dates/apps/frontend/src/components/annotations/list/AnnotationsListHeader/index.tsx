/* * */

import { openCreateAnnotationModal } from '@/components/annotations/create/AnnotationCreate.modal';
import { useAnnotationsListContext } from '@/components/annotations/list/AnnotationsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AnnotationsListHeader() {
	//

	//
	// A. Setup variables

	const annotationsListContext = useAnnotationsListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Anotações</Label>
			<Spacer />
			<SearchInput onChange={annotationsListContext.filters.search.set} value={annotationsListContext.filters.search.value} />
			<HasPermission action={PermissionCatalog.all.annotations.actions.create} scope={PermissionCatalog.all.annotations.scope}>
				<Button label="Nova anotação" leftSection={<IconPlus />} onClick={openCreateAnnotationModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
