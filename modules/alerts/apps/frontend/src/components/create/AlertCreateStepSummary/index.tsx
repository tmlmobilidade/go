/* * */

import { UploadImage } from '@/components/common/other/UploadImage';
import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { Translations } from '@/lib/translations';
import { IconLink } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CoordinatesInput, Divider, Grid, HasPermission, Section, Switch, Textarea, TextInput, useMeContext, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateStepSummary() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const hasPermissionToEdit = meContext.actions.hasPermissionResource({
		action: PermissionCatalog.all.alerts.actions.update_texts,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.alerts.scope,
		value: alertCreateContext.data.form.getValues().agency_id,
	}) && !alertCreateContext.data.form.getValues().auto_texts;

	//
	// C. Render components

	return (
		<>

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
						defaultValue={alertCreateContext.data.form.getValues().title}
						label="Título"
						readOnly={!hasPermissionToEdit}
					/>
					<Textarea
						defaultValue={alertCreateContext.data.form.getValues().description}
						label="Descrição"
						minRows={4}
						readOnly={!hasPermissionToEdit}
						autosize
					/>
					<CoordinatesInput
						key={alertCreateContext.data.form.key('coordinates')}
						description="Ponto de referência do alerta, para que seja possível localizar o alerta no mapa."
						label="Coordenadas"
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

			<Divider />

			<Section>
				<Grid columns="abc" gap="md">
					<ValueDisplay label="Causa" value={Translations.CAUSE[alertCreateContext.data.form.getValues().cause]} bordered />
					<ValueDisplay label="Efeito" value={Translations.EFFECT[alertCreateContext.data.form.getValues().effect]} bordered />
					<ValueDisplay label="Circulações Afetadas" value={alertCreateContext.data.form.getValues().references?.length} bordered />
				</Grid>
			</Section>

		</>
	);

	//
}
