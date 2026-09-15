'use client';

import { openAnnotationsCreateModal } from '@/components/annotations/create/AnnotationsCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { AnnotationsListFilterSearch } from '../filters/AnnotationsListFilterSearch';
import { useAnnotationsListData } from '../use-annotations-list-data';

/* * */

export function AnnotationsListHeader() {
	//

	//
	// A. Setup variables

	const { isLoading, isValidating, timestamp } = useAnnotationsListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Anotações</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<AnnotationsListFilterSearch />
			<HasPermission action={PermissionCatalog.all.annotations.actions.create} scope={PermissionCatalog.all.annotations.scope}>
				<Button
					icon={<IconPlus size={20} />}
					label="Nova anotação"
					onClick={openAnnotationsCreateModal}
				/>
			</HasPermission>
		</Toolbar>
	);
}
