/* * */

import { openCreateAnnotationModal } from '@/components/annotations/create/AnnotationCreate.modal';
import { useAnnotationsListContext } from '@/components/annotations/list/AnnotationsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';

/* * */

export function AnnotationsListHeader() {
	//

	//
	// A. Setup variables

	const annotationsListContext = useAnnotationsListContext();

	//
	// B. Render components

	return (
		<ListHeader
			count={annotationsListContext.data.filtered.length}
			search={<SearchField onChange={annotationsListContext.filters.search.set} value={annotationsListContext.filters.search.value} />}
			title="Anotações"
			actions={(
				<HasPermission action={PermissionCatalog.all.annotations.actions.create} scope={PermissionCatalog.all.annotations.scope}>
					<Button label="Nova anotação" leftSection={<IconPlus />} onClick={openCreateAnnotationModal} />
				</HasPermission>
			)}
		/>
	);
}
