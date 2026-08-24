'use client';

import { useValidationCreateContext } from '@/components/validations/create/ValidationCreateForm.context';
import { closeCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { AgencyTag, Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

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
				agencyId={validationCreateContext.data.selected_agency_id}
				request={{
					permissions: {
						actions: [PermissionCatalog.all.gtfs_validations.actions.create],
						scope: PermissionCatalog.all.gtfs_validations.scope,
					},
				}}
			/>
			<Spacer />
			<Button
				disabled={!validationCreateContext.flags.can_create}
				label="Criar validação"
				loading={validationCreateContext.flags.loading}
				onClick={validationCreateContext.actions.createValidation}
			/>
		</Toolbar>
	);

	//
}
