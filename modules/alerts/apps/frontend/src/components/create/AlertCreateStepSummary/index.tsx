/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { AlertCreateStepSummaryAi } from '@/components/create/AlertCreateStepSummaryAi';
import { IconLink } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CoordinatesInput, Grid, Section, Textarea, TextInput, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepSummary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

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

				<AlertCreateStepSummaryAi />

				<TextInput
					key={alertCreateContext.data.form.key('title')}
					label={t('default:alerts.create.summary.title.label')}
					readOnly={!hasPermissionToEdit}
					{...alertCreateContext.data.form.getInputProps('title')}
				/>

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
					description={t('default:alerts.create.summary.info_url.description')}
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
