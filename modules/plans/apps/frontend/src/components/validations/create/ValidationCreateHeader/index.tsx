'use client';

import { closeCreateValidationModal } from '@/components/validations/create/ValidationCreate.modal';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { AgencyTag, Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { useValidationsAgencies } from '../../shared/use-validations-agencies';
import { useValidationCreateContext } from '../ValidationCreateForm.context';

/* * */

export function ValidationCreateHeader() {
	//

	//
	// A. Setup variables

	const validationCreateContext = useValidationCreateContext();
	const { data: agenciesData } = useValidationsAgencies({
		permissions: {
			actions: [PermissionCatalog.all.gtfs_validations.actions.create],
			scope: PermissionCatalog.all.gtfs_validations.scope,
		},
	});

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateValidationModal} type="close" />
			<Label size="lg" caps singleLine>Nova Validação GTFS</Label>
			<AgencyTag
				agencyId={validationCreateContext.data.selectedAgencyId}
				data={agenciesData}
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
