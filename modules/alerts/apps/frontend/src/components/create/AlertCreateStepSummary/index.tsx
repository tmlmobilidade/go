/* * */

import { UploadImage } from '@/components/common/other/UploadImage';
import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { IconLink } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CoordinatesInput, Grid, HasPermission, Section, Switch, Textarea, TextInput, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertCreateStepSummary() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const hasPermissionToEdit = useMemo(() => {
		const canEditThisAgency = meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().agency_id,
		});
		const canEditThisReferenceType = meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().reference_type,
		});
		const autoTextsEnabled = alertCreateContext.data.form.getValues().auto_texts;
		// User can edit texts if they have permission for the agency
		// and reference type, and auto texts is disabled.
		return canEditThisAgency && canEditThisReferenceType && !autoTextsEnabled;
	}, [
		meContext.data.user?.permissions,
		alertCreateContext.data.form.getValues().agency_id,
		alertCreateContext.data.form.getValues().reference_type,
		alertCreateContext.data.form.getValues().auto_texts,
	]);

	//
	// C. Render components

	return (
		<Section gap="md">
			<HasPermission
				action={PermissionCatalog.all.alerts.actions.update_texts}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.alerts.scope}
				value={alertCreateContext.data.form.getValues().agency_id}
			>
				<Switch
					key={alertCreateContext.data.form.key('auto_texts')}
					label="Textos Automáticos"
					{...alertCreateContext.data.form.getInputProps('auto_texts', { type: 'checkbox' })}
				/>
			</HasPermission>
			<Grid gap="md">
				<TextInput
					key={alertCreateContext.data.form.key('title')}
					label="Título"
					readOnly={!hasPermissionToEdit}
					{...alertCreateContext.data.form.getInputProps('title')}
				/>
				<Textarea
					key={alertCreateContext.data.form.key('description')}
					label="Descrição"
					minRows={4}
					readOnly={!hasPermissionToEdit}
					autosize
					{...alertCreateContext.data.form.getInputProps('description')}
				/>
				<CoordinatesInput
					key={alertCreateContext.data.form.key('coordinates')}
					label="Coordenadas Geográficas"
					{...alertCreateContext.data.form.getInputProps('coordinates')}
				/>
				<TextInput
					key={alertCreateContext.data.form.key('info_url')}
					description="Opcionalmente inclua o URL de um website onde é possivel obter mais informação"
					label="Link Adicional"
					leftSection={<IconLink />}
					placeholder="https://www.cm-setubal.com/..."
					{...alertCreateContext.data.form.getInputProps('info_url')}
				/>
				<UploadImage
					// imageUrl={alertCreateContext.data.image?.url}
					label="Imagem"
					// onDelete={alertCreateContext.actions.deleteImage}
					// onFileChange={alertCreateContext.actions.fileChanged}
				/>
			</Grid>
		</Section>
	);

	//
}
