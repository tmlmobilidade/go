/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { AlertCreateStepSummaryAi } from '@/components/create/AlertCreateStepSummaryAi';
import { IconLink } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { CoordinatesInput, Grid, Section, Textarea, TextInput, useMeContext } from '@tmlmobilidade/ui';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepSummary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

	const agencyIdValue = alertCreateContext.form.instance.watch('agency_id');
	const referenceTypeValue = alertCreateContext.form.instance.watch('reference_type');

	//
	// B. Transform data

	const hasPermissionToEdit = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: agencyIdValue,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: referenceTypeValue,
		},
	]);

	//
	// C. Render components

	return (
		<Section gap="md">
			<Grid gap="md">

				<AlertCreateStepSummaryAi />

				<Controller
					control={alertCreateContext.form.instance.control}
					name="title"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('default:alerts.create.summary.title.label')}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							readOnly={!hasPermissionToEdit}
							value={field.value ?? ''}
						/>
					)}
				/>

				<Controller
					control={alertCreateContext.form.instance.control}
					name="description"
					render={({ field, fieldState }) => (
						<Textarea
							error={fieldState.error?.message}
							label={t('default:alerts.create.summary.description.label')}
							minRows={4}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							readOnly={!hasPermissionToEdit}
							value={field.value ?? ''}
							autosize
						/>
					)}
				/>

				<Controller
					control={alertCreateContext.form.instance.control}
					name="coordinates"
					render={({ field, fieldState }) => (
						<CoordinatesInput
							key="key"
							defaultValue={field.value}
							label={t('default:alerts.create.summary.coordinates.label')}
							onChange={field.onChange}
						/>
					)}
				/>

				<Controller
					control={alertCreateContext.form.instance.control}
					name="info_url"
					render={({ field, fieldState }) => (
						<TextInput
							description={t('default:alerts.create.summary.info_url.description')}
							error={fieldState.error?.message}
							label={t('default:alerts.create.summary.info_url.label')}
							leftSection={<IconLink />}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="https://www.cm-setubal.com/..."
							value={field.value ?? ''}
						/>
					)}
				/>

			</Grid>
		</Section>
	);

	//
}
