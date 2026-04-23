/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { IconLink } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CoordinatesInput, Grid, Section, Switch, Textarea, TextInput, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepSummary() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const hasPermissionToEdit = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().agency_id,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().reference_type,
		},
	]);

	//
	// C. Render components

	return (
		<Section gap="md">
			<Grid gap="md">
				<TextInput
					key={alertCreateContext.data.form.key('title')}
					label={t('default:alerts.create.summary.title.label')}
					readOnly={!hasPermissionToEdit}
					{...alertCreateContext.data.form.getInputProps('title')}
				/>
				<Section padding="none">
					<Switch
						key={alertCreateContext.data.form.key('auto_texts')}
						label={t('default:alerts.create.summary.auto_text.label')}
						{...alertCreateContext.data.form.getInputProps('auto_texts', { type: 'checkbox' })}
					/>
				</Section>
				<Textarea
					key={alertCreateContext.data.form.key('description')}
					label={t('default:alerts.create.summary.description.label')}
					minRows={4}
					readOnly={!hasPermissionToEdit}
					autosize
					{...alertCreateContext.data.form.getInputProps('description')}
				/>
				<CoordinatesInput
					key={alertCreateContext.data.form.key('coordinates')}
					label={t('default:alerts.create.summary.coordinates.label')}
					{...alertCreateContext.data.form.getInputProps('coordinates')}
				/>
				<TextInput
					key={alertCreateContext.data.form.key('info_url')}
					description="Opcionalmente inclua o URL de um website onde é possivel obter mais informação"
					label={t('default:alerts.create.summary.info_url.label')}
					leftSection={<IconLink />}
					placeholder="https://www.cm-setubal.com/..."
					{...alertCreateContext.data.form.getInputProps('info_url')}
				/>
			</Grid>
		</Section>
	);

	//
}
