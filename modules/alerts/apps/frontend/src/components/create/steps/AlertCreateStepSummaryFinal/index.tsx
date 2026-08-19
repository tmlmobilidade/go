/* * */

import { normalizeAlertCoordinatesInput } from '@/lib/alert-coordinates';
import { IconLink } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { ContextFormController, CoordinatesInput, Grid, Section, Textarea, TextInput, useContextFormWatch, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsCreateFormContext } from '../../shared/AlertsCreateForm.context';

/* * */

export function AlertCreateStepSummaryFinal() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();

	const { form: alertsCreateForm } = useAlertsCreateFormContext();

	const agencyIdValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'agency_id' });
	const referenceTypeValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'reference_type' });

	//
	// B. Transform data

	const hasPermissionToUpdateTexts = meContext.actions.hasPermissionResource([
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

				<ContextFormController
					control={alertsCreateForm.control}
					name="title"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('alerts:create.summary.title.label')}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							readOnly={!hasPermissionToUpdateTexts}
							value={field.value ?? ''}
						/>
					)}
				/>

				<ContextFormController
					control={alertsCreateForm.control}
					name="description"
					render={({ field, fieldState }) => (
						<Textarea
							error={fieldState.error?.message}
							label={t('alerts:create.summary.description.label')}
							minRows={4}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							readOnly={!hasPermissionToUpdateTexts}
							value={field.value ?? ''}
							autosize
						/>
					)}
				/>

				<ContextFormController
					control={alertsCreateForm.control}
					name="coordinates"
					render={({ field }) => (
						<CoordinatesInput
							key="key"
							label={t('alerts:create.summary.coordinates.label')}
							onChange={nextValue => field.onChange(normalizeAlertCoordinatesInput(nextValue))}
							value={field.value ?? undefined}
						/>
					)}
				/>

				<ContextFormController
					control={alertsCreateForm.control}
					name="info_url"
					render={({ field, fieldState }) => (
						<TextInput
							description={t('alerts:create.summary.info_url.description')}
							error={fieldState.error?.message}
							label={t('alerts:create.summary.info_url.label')}
							leftSection={<IconLink />}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="https://www.cm-setubal.com/..."
							readOnly={!hasPermissionToUpdateTexts}
							value={field.value ?? ''}
						/>
					)}
				/>

			</Grid>
		</Section>
	);
}
