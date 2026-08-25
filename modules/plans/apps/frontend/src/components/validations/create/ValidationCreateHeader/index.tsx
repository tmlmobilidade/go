'use client';

import { closeCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { AgencyTag, Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { useValidationCreateContext } from '../ValidationCreateForm.context';

/* * */

export function ValidationCreateHeader() {
	//

	//
	// A. Setup variables

	const validationCreateContext = useValidationCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateValidationModal} type="close" />
			<Label size="lg" caps singleLine>Nova Validação GTFS</Label>
			<AgencyTag
				agencyId={validationCreateContext.data.selectedAgencyId}
				request={{
					permissions: {
						actions: [PermissionCatalog.all.gtfs_validations.actions.create],
						scope: PermissionCatalog.all.gtfs_validations.scope,
					},
				}}
			/>
			<Spacer />
			<Button
				disabled={!validationCreateContext.capabilities?.createEnabled}
				label="Criar validação"
				loading={validationCreateContext.status.isCreating}
				onClick={validationCreateContext.actions.create}
			/>
		</Toolbar>
	);

	//
}
