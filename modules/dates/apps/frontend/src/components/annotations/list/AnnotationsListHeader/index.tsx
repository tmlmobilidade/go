/* * */

import { openCreateAnnotationModal } from '@/components/annotations/detail/CreateAnnotationModal';
import { useAnnotationsListContext } from '@/contexts/AnnotationsList.context';
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
			<Label size="lg" caps singleLine>Ocorrências</Label>
			<Spacer />
			<SearchInput onChange={annotationsListContext.actions.setFilterSearch} value={annotationsListContext.filters.search} />
			<HasPermission action={PermissionCatalog.all.dates.actions.create_annotations} scope={PermissionCatalog.all.dates.scope}>
				<Button label="Nova ocorrência" leftSection={<IconPlus />} onClick={openCreateAnnotationModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
