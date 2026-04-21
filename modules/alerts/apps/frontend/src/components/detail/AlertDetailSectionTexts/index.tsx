'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { IconLink } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, CoordinatesInput, Grid, ImageUpload, Section, Textarea, TextInput, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function AlertDetailSectionTexts() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const hasPermissionToEdit = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.agency_id,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.reference_type,
		},
	]);

	//
	// C. Render components

	return (
		<Collapsible
			description="Breve descrição do que motivou a criação do alerta"
			title="Título e Descrição"
		>
			<Section gap="md">
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
					<ImageUpload
						label="Imagem"
						onChange={alertDetailContext.actions.setImageFile}
						onDelete={alertDetailContext.actions.deleteImage}
						value={alertDetailContext.data.image?.url}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
