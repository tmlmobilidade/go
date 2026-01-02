'use client';

/* * */

import { UploadImage } from '@/components/common/other/UploadImage';
import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { IconLink } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, CoordinatesInput, Grid, HasPermission, Section, Switch, Textarea, TextInput, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function AlertDetailSectionTexts() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const hasPermissionToEdit = useMemo(() => {
		const canEditThisAgency = meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.agency_id,
		});
		const canEditThisReferenceType = meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.reference_type,
		});
		const autoTextsEnabled = alertDetailContext.data.form.getValues().auto_texts;
		// User can edit texts if they have permission for the agency
		// and reference type, and auto texts is disabled.
		return canEditThisAgency && canEditThisReferenceType && !autoTextsEnabled;
	}, [
		meContext.data.user?.permissions,
		alertDetailContext.data.alert.agency_id,
		alertDetailContext.data.alert.reference_type,
		alertDetailContext.data.form.getValues().auto_texts,
	]);

	//
	// C. Render components

	return (
		<Collapsible
			description="Breve descrição do que motivou a criação do alerta"
			title="Título e Descrição"
		>
			<Section gap="md">
				<HasPermission
					action={PermissionCatalog.all.alerts.actions.update_texts}
					resourceKey="agency_ids"
					scope={PermissionCatalog.all.alerts.scope}
					value={alertDetailContext.data.alert.agency_id}
				>
					<Switch
						key={alertDetailContext.data.form.key('auto_texts')}
						label="Textos Automáticos"
						{...alertDetailContext.data.form.getInputProps('auto_texts', { type: 'checkbox' })}
					/>
				</HasPermission>
				<Grid gap="md">
					<TextInput
						key={alertDetailContext.data.form.key('title')}
						description="É importante que o título seja curto e claro, para que não apareça cortado no site, apps, etc."
						label="Título Curto"
						maxLength={255}
						readOnly={!hasPermissionToEdit}
						withAsterisk
						{...alertDetailContext.data.form.getInputProps('title')}
					/>
					<Textarea
						key={alertDetailContext.data.form.key('description')}
						description="Um bom alerta explica a situação de forma breve e clara, explicita as suas causas e como está a ser mitigado, e apresenta uma ou mais soluções de como o passageiro poderá ultrapassar esta situação."
						label="Descrição"
						maxRows={10}
						minRows={4}
						readOnly={!hasPermissionToEdit}
						autosize
						withAsterisk
						{...alertDetailContext.data.form.getInputProps('description')}
					/>
					<CoordinatesInput
						key={alertDetailContext.data.form.key('coordinates')}
						label="Coordenadas Geográficas"
						{...alertDetailContext.data.form.getInputProps('coordinates')}
					/>
					<TextInput
						key={alertDetailContext.data.form.key('info_url')}
						description="Opcionalmente inclua o URL de um website onde é possivel obter mais informação"
						label="Link Adicional"
						leftSection={<IconLink size={18} />}
						placeholder="https://www.cm-setubal.com/..."
						{...alertDetailContext.data.form.getInputProps('info_url')}
					/>
					<UploadImage
						imageUrl={alertDetailContext.data.image?.url}
						label="Imagem"
						onDelete={alertDetailContext.actions.deleteImage}
						onFileChange={alertDetailContext.actions.fileChanged}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
